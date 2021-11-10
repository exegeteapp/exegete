from fastapi import APIRouter, Depends
from fastapi.responses import Response
from ..redis import redis

scripture_router = APIRouter(prefix="/scripture", tags=["scripture"])


@scripture_router.get("/catalog", tags=["scripture"])
async def get_catalog():
    catalog = await redis.get("catalog")
    assert catalog is not None
    return Response(content=catalog, media_type="application/json")
