import asyncpg
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from typing import List
from fastapi import HTTPException
import jsonschema
from ..models import WorkspaceIn, WorkspaceOut
from ..database import database, Workspace
from sqlalchemy.dialects import postgresql

from exegete.workspace.manager import WorkspaceManager
from ..redis import redis
from ..users import current_user, UserDB

workspace_router = APIRouter(prefix="/workspace", tags=["workspace"])
workspace_manager = WorkspaceManager()


@workspace_router.get("/{id:uuid}", response_model=WorkspaceOut)
async def get_workspace(id, user: UserDB = Depends(current_user)):
    workspace = Workspace.__table__.select().filter(
        Workspace.owner_id == user.id, Workspace.id == id
    )
    return await database.fetch_one(workspace)


@workspace_router.get("/", response_model=List[WorkspaceOut])
async def list_workspaces(user: UserDB = Depends(current_user)):
    workspaces = Workspace.__table__.select().filter(Workspace.owner_id == user.id)
    return await database.fetch_all(workspaces)


# we only allow PUT. UUIDs for new documents are generated on the client-side
@workspace_router.put("/{id:uuid}")
async def put_workspace(id, doc: WorkspaceIn, user: UserDB = Depends(current_user)):
    # validate the incoming workspace
    try:
        workspace_manager.validate(doc.data)
    except jsonschema.exceptions.ValidationError as exc:
        raise HTTPException(422, str(exc))
    # fast-path: update existing document owned by the current user
    q = (
        Workspace.__table__.update()
        .where(Workspace.owner_id == user.id, Workspace.id == id)
        .values(title=doc.title, data=doc.data)
        .returning(Workspace.id)
    )
    success = await database.fetch_all(q)
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
        success = await database.fetch_all(q)
        if len(success) > 0:
            return
        raise HTTPException(403, "You do not have permission to PUT workspace")
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(403, "You do not have permission to PUT workspace")
