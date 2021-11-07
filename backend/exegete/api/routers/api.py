import json
from fastapi import APIRouter, Depends
from fastapi.responses import Response

from ..models import UserDB
from ..users import current_active_user, fastapi_users, jwt_authentication
from ..register import get_register_captcha_router
from ..database import UserDB
from .config import config_router
from ..redis import redis

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(
    fastapi_users.get_auth_router(jwt_authentication),
    prefix="/auth",
    tags=["auth"],
)
api_router.include_router(
    get_register_captcha_router(
        fastapi_users.get_user_manager,
        UserDB,
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


@api_router.get("/catalog")
async def get_catalog():
    catalog = await redis.get("catalog")
    assert catalog is not None
    return Response(content=catalog, media_type="application/json")


@api_router.get("/authenticated-route")
async def authenticated_route(user: UserDB = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}
