import json
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from .redis import redis
from .routers.api import api_router

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.include_router(api_router)


@app.on_event("startup")
async def startup():
    from .scripture.catalog import get_catalog_singleton

    catalog = get_catalog_singleton()
    toc = catalog.make_toc()
    await redis.set("catalog", json.dumps(toc))
