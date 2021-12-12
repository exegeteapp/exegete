from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from ..redis import redis
from ..users import current_user, UserDB

workspace_router = APIRouter(prefix="/workspace", tags=["workspace"])


@workspace_router.get("/{id:uuid}")
async def get_workspace(id, user: UserDB = Depends(current_user)):
    return {"message": f"Hello {user.email}!"}


@workspace_router.post("/}")
async def post_workspace(user: UserDB = Depends(current_user)):
    # make a new workspace, allocate it a UUID
    return {}


@workspace_router.put("/{id:uuid}")
async def put_workspace(user: UserDB = Depends(current_user)):
    # update an existing workspace
    return {}
