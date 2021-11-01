import sqlalchemy
import os
from exegete.settings import settings
from uuid import uuid4
from sqlalchemy.schema import CreateSchema, MetaData
from typing import Callable, TypeVar


class Manager:
    def __init__(self):
        self.engine = sqlalchemy.create_engine(
            settings.pg_dsn,
            echo="INGEST_DEBUG" in os.environ,
            future=True,
        )

    ModuleInstance = TypeVar("ModuleInstance")

    def create_module(
        self, module_cls: Callable[[], ModuleInstance], **kwargs
    ) -> ModuleInstance:
        # the schema name is just a UUID with a prefix
        module_schema = module_cls.SCHEMA_PREFIX + ":" + str(uuid4())
        with self.engine.connect() as conn:
            conn.execute(CreateSchema(module_schema))
            conn.commit()
        metadata = MetaData()
        entities = module_cls.make_entities(metadata, module_schema)
        metadata.create_all(self.engine)
        return module_cls.create(self, metadata, entities, **kwargs)