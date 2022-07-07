from fastapi import APIRouter

from ..users import fastapi_users, auth_backend
from ..register import get_register_captcha_router
from ..schemas import UserCreate, UserRead, UserUpdate
from .scripture import scripture_router
from .workspace import workspace_router
from .config import config_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    get_register_captcha_router(fastapi_users.get_user_manager, UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
api_router.include_router(config_router)
api_router.include_router(scripture_router)
api_router.include_router(workspace_router)
