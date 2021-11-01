from fastapi import APIRouter
from exegete.settings import settings

config_router = APIRouter()


@config_router.get("/config")
async def config():
    "unauthenticated endpoint used by the react front-end to configure itself"
    return {"recaptcha_site_key": settings.recaptcha_site_key}
