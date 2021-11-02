from fastapi import FastAPI

app = FastAPI()


from fastapi import FastAPI

from .database import database
from .routers.api import api_router

app = FastAPI()
app.include_router(api_router)


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
