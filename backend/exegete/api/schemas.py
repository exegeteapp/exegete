from fastapi_users import schemas
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
import datetime
import uuid


class UserRead(schemas.BaseUser[uuid.UUID]):
    name: str
    affiliation: str


class UserCreate(schemas.BaseUserCreate):
    name: str
    affiliation: str


class UserUpdate(schemas.BaseUserUpdate):
    name: str
    affiliation: str


class WorkspaceOut(BaseModel):
    id: UUID
    title: str
    data: dict
    created: datetime.datetime
    updated: Optional[datetime.datetime]

    class Config:
        arbitrary_types_allowed = True


class WorkspaceIn(BaseModel):
    title: str
    data: dict

    class Config:
        arbitrary_types_allowed = True
