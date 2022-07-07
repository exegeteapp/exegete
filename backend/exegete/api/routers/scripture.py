from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from ..redis import redis
from ..scripture.catalog import get_catalog_singleton, InvalidReference

scripture_router = APIRouter(prefix="/scripture", tags=["scripture"])


@scripture_router.get("/catalog", tags=["scripture"])
async def get_catalog():
    obj = await redis.get("catalog")
    assert obj is not None
    # optimisation: we store the catalog in redis as a
    # JSON encoded bytestring and we just spool that straight back
    # out without decoding/encoding it
    return Response(content=obj, media_type="application/json")


@scripture_router.get("/verses/{shortcode}/{book}", tags=["scripture"])
async def get_verses(
    shortcode: str,
    book: str,
    chapter_start: int,
    verse_start: int,
    chapter_end: int,
    verse_end: int,
):
    try:
        catalog = get_catalog_singleton()
        scripture_json_text = await catalog.get_scripture(
            shortcode, book, chapter_start, verse_start, chapter_end, verse_end
        )
        return Response(content=scripture_json_text, media_type="application/json")
    except InvalidReference:
        raise HTTPException(status_code=404, detail="Book not found")
