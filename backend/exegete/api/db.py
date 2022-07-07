from typing import AsyncGenerator
from exegete.settings import settings
from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy import GUID
from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func

Base: DeclarativeMeta = declarative_base()

sync_engine = settings.create_sync_engine()
sync_session_maker = sessionmaker(sync_engine, expire_on_commit=False)

async_engine = settings.create_async_engine()
async_session_maker = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)


class User(SQLAlchemyBaseUserTableUUID, Base):
    name = Column(Text, default=False, nullable=False)
    affiliation = Column(Text, default=False, nullable=False)


class Workspace(Base):
    __tablename__ = "workspace"
    id = Column(GUID, primary_key=True, unique=True)
    owner_id = Column(
        ForeignKey(User.id),
        nullable=False,
    )
    title = Column(Text, default=False, nullable=False)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())
    data = Column(JSONB, default=False, nullable=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
