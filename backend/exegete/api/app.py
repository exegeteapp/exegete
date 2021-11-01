from fastapi import FastAPI

app = FastAPI()


from fastapi import FastAPI

from .database import make_tables, database
from .routers.api import api_router

app = FastAPI()
app.include_router(api_router)


@app.on_event("startup")
async def startup():
    make_tables()
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
