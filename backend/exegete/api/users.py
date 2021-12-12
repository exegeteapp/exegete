from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers
from fastapi_users.authentication import JWTAuthentication
from fastapi_users.db import SQLAlchemyUserDatabase

from .database import get_user_db
from .models import User, UserCreate, UserDB, UserUpdate
from exegete.settings import settings
from exegete.comms.mailgun import forgot_password_email, registration_email


class UserManager(BaseUserManager[UserCreate, UserDB]):
    user_db_model = UserDB
    reset_password_token_secret = settings.token_secret
    verification_token_secret = settings.token_secret

    async def on_after_register(self, user: UserDB, request: Optional[Request] = None):
        # we send the verification email via the after_request_verify hook
        pass

    async def on_after_forgot_password(
        self, user: UserDB, token: str, request: Optional[Request] = None
    ):
        await forgot_password_email(user, token)

    async def on_after_request_verify(
        self, user: UserDB, token: str, request: Optional[Request] = None
    ):
        await registration_email(user, token)


def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


jwt_authentication = JWTAuthentication(
    secret=settings.token_secret, lifetime_seconds=3600, tokenUrl="auth/jwt/login"
)

fastapi_users = FastAPIUsers(
    get_user_manager,
    [jwt_authentication],
    User,
    UserCreate,
    UserUpdate,
    UserDB,
)

current_user = fastapi_users.current_user()
