from fastapi_users import models
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
import datetime


class User(models.BaseUser):
    name: str
    affiliation: str


class UserCreate(models.BaseUserCreate):
    name: str
    affiliation: str
    captcha: str


class UserUpdate(models.BaseUserUpdate):
    name: str
    affiliation: str


class UserDB(User, models.BaseUserDB):
    pass


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
