from typing import List

import zipfile
import asyncpg
import jsonschema
import datetime
import sqlalchemy
import io
from exegete.workspace.manager import WorkspaceManager
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from ..db import User, Workspace, async_engine
from ..schemas import WorkspaceIn, WorkspaceOut, WorkspaceListingOut
from ..users import current_user

workspace_router = APIRouter(prefix="/workspace", tags=["workspace"])
workspace_manager = WorkspaceManager()


async def fetch_workspace_from_db(user, id):
    """
    this function won't return the database if the user doesn't own it.
    """
    async with async_engine.connect() as conn:
        workspace = Workspace.__table__.select().filter(
            Workspace.owner_id == user.id, Workspace.id == id
        )
        try:
            return (await conn.execute(workspace)).one()
        except sqlalchemy.exc.NoResultFound:
            raise HTTPException(403, "Workspace not found or permissions error.")


@workspace_router.get("/{id:uuid}", response_model=WorkspaceOut)
async def get_workspace(
    id,
    user: User = Depends(current_user),
):
    return await fetch_workspace_from_db(user, id)


@workspace_router.get("/download/{id:uuid}")
async def download_workspace(id, user: User = Depends(current_user)):
    def make_filename(s):
        keepcharacters = (" ", "_")
        return "".join(c for c in s if c.isalnum() or c in keepcharacters).rstrip()

    fd = io.BytesIO()
    workspace_data = WorkspaceOut.parse_obj(await fetch_workspace_from_db(user, id))
    with zipfile.ZipFile(
        fd, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
    ) as zip_file:
        pfx = "exegete/{}/".format(id)
        zip_file.writestr("{}/workspace.json".format(pfx), workspace_data.json())
        zip_file.writestr(
            "{}/README.txt".format(pfx),
            "This is an workspace exported from https://exegete.app/ on {}\n".format(
                datetime.datetime.now().isoformat()
            ),
        )
    return StreamingResponse(
        iter([fd.getvalue()]),
        media_type="application/x-exegete-workspace",
    )


@workspace_router.get("/", response_model=List[WorkspaceListingOut])
async def list_workspaces(
    user: User = Depends(current_user),
):
    async with async_engine.connect() as conn:
        workspaces = Workspace.__table__.select().filter(Workspace.owner_id == user.id)
        res = (await conn.execute(workspaces)).all()
        return res


# we only allow PUT. UUIDs for new documents are generated on the client-side
@workspace_router.put("/{id:uuid}")
async def put_workspace(
    id,
    doc: WorkspaceIn,
    user: User = Depends(current_user),
):
    # validate the incoming workspace
    try:
        workspace_manager.validate(doc.data)
    except jsonschema.exceptions.ValidationError as exc:
        raise HTTPException(422, str(exc))

    async with async_engine.connect() as conn:
        # fast-path: update existing document owned by the current user
        q = (
            Workspace.__table__.update()
            .where(Workspace.owner_id == user.id, Workspace.id == id)
            .values(title=doc.title, data=doc.data)
            .returning(Workspace.id)
        )
        success = (await conn.execute(q)).all()
        await conn.commit()
        if len(success) > 0:
            return

        # slow-path: update() didn't change any rows, so we need to insert a new row
        # if the document exists and the user isn't the owner, no row is inserted
        # and so we return a 403
        try:
            q = (
                Workspace.__table__.insert()
                .values(id=id, title=doc.title, data=doc.data, owner_id=user.id)
                .returning(Workspace.id)
            )
            success = (await conn.execute(q)).all()
            await conn.commit()
            if len(success) > 0:
                return
            raise HTTPException(403, "You do not have permission to PUT workspace")
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(403, "You do not have permission to PUT workspace")


@workspace_router.delete("/{id:uuid}")
async def delete_workspace(
    id,
    user: User = Depends(current_user),
):
    q = (
        Workspace.__table__.delete()
        .where(Workspace.owner_id == user.id, Workspace.id == id)
        .returning(Workspace.id)
    )
    async with async_engine.connect() as conn:
        success = (await conn.execute(q)).all()
        await conn.commit()
        if len(success) > 0:
            return
        raise HTTPException(403, "You do not have permission to DELETE workspace")
