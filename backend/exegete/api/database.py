import databases
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from exegete.settings import settings
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy import GUID
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy import Column, Text

from .models import UserDB

database = databases.Database(settings.pg_dsn)
Base: DeclarativeMeta = declarative_base()


class UserTable(Base, SQLAlchemyBaseUserTable):
    name = Column(Text, default=False, nullable=False)
    affiliation = Column(Text, default=False, nullable=False)


class Workspace(Base):
    __tablename__ = "workspace"
    id = Column(GUID, primary_key=True)
    owner_id = Column(
        ForeignKey(UserTable.id),
        nullable=False,
        primary_key=True,
    )
    title = Column(Text, default=False, nullable=False)
    workspace = Column(JSONB, default=False, nullable=False)


def get_user_db():
    users = UserTable.__table__
    yield SQLAlchemyUserDatabase(UserDB, database, users)
