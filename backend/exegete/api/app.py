from fastapi import FastAPI
import json

app = FastAPI()


from fastapi import FastAPI

from .database import database
from .routers.api import api_router
from .scripture.catalog import ScriptureCatalog
from .redis import redis

app = FastAPI()
app.include_router(api_router)


@app.on_event("startup")
async def startup():
    await database.connect()
    catalog = ScriptureCatalog()
    toc = catalog.make_toc()
    await redis.set("catalog", json.dumps(toc))


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
