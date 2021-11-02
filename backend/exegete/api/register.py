from typing import Type
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi_users import models
from fastapi_users.manager import (
    BaseUserManager,
    InvalidPasswordException,
    UserAlreadyExists,
    UserManagerDependency,
)
from ..captcha import recaptcha_check
from fastapi_users.router.common import ErrorCode

# copied in from fastapi-users so that we can add recaptcha logic
def get_register_captcha_router(
    get_user_manager: UserManagerDependency[models.UC, models.UD],
    user_model: Type[models.U],
    user_create_model: Type[models.UC],
) -> APIRouter:
    """Generate a router with the register route."""
    router = APIRouter()

    @router.post(
        "/register", response_model=user_model, status_code=status.HTTP_201_CREATED
    )
    async def register(
        request: Request,
        user: user_create_model,  # type: ignore
        user_manager: BaseUserManager[models.UC, models.UD] = Depends(get_user_manager),
    ):
        captcha = user.captcha
        captcha_check =  await recaptcha_check(captcha)
        if captcha_check.get('success', False) is not True:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=captcha_check.get('error-codes', [])
            )
        try:
            created_user = await user_manager.create(user, safe=True, request=request)
        except UserAlreadyExists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorCode.REGISTER_USER_ALREADY_EXISTS,
            )
        except InvalidPasswordException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": ErrorCode.REGISTER_INVALID_PASSWORD,
                    "reason": e.reason,
                },
            )

        return created_user

    return router
