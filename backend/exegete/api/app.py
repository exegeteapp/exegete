from fastapi import FastAPI
import json

app = FastAPI()


from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

from .routers.api import api_router
from .redis import redis

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.include_router(api_router)


@app.on_event("startup")
async def startup():
    from .scripture.catalog import get_catalog_singleton

    catalog = get_catalog_singleton()
    toc = catalog.make_toc()
    await redis.set("catalog", json.dumps(toc))
