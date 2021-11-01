import databases
import sqlalchemy
from exegete.settings import settings
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy import Column, Text

from .models import UserDB

database = databases.Database(settings.pg_dsn)
Base: DeclarativeMeta = declarative_base()


class UserTable(Base, SQLAlchemyBaseUserTable):
    name = Column(Text, default=False, nullable=False)
    affiliation = Column(Text, default=False, nullable=False)


def make_tables():
    engine = sqlalchemy.create_engine(settings.pg_dsn)
    Base.metadata.create_all(engine)


def get_user_db():
    users = UserTable.__table__
    yield SQLAlchemyUserDatabase(UserDB, database, users)
