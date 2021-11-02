from fastapi_users import models


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
