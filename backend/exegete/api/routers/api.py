from fastapi import APIRouter, Depends

from ..models import UserDB
from ..users import current_active_user, fastapi_users, jwt_authentication
from ..register import get_register_captcha_router
from .config import config_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(
    fastapi_users.get_auth_router(jwt_authentication),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    get_register_captcha_router(
        fastapi_users.get_user_manager,
        fastapi_users._user_model,
        fastapi_users._user_create_model,
    ),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    fastapi_users.get_verify_router(),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    fastapi_users.get_users_router(), prefix="/users", tags=["users"]
)
api_router.include_router(config_router)


@api_router.get("/authenticated-route")
async def authenticated_route(user: UserDB = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}
