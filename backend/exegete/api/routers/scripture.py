from fastapi import APIRouter
from fastapi.responses import Response
from ..redis import redis

scripture_router = APIRouter(prefix="/scripture", tags=["scripture"])


@scripture_router.get("/catalog", tags=["scripture"])
async def get_catalog():
    catalog = await redis.get("catalog")
    assert catalog is not None
    return Response(content=catalog, media_type="application/json")


@scripture_router.get("/verses", tags=["scripture"])
async def get_verses(
    shortcode: str,
    book: str,
    chapter_start: int,
    chapter_end: int,
    verse_start: int,
    verse_end: int,
):
    pass
