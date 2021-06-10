from sqlalchemy import insert, Index, Enum, select, update
from sqlalchemy.schema import Table, Column, MetaData, ForeignKey
from sqlalchemy.sql.schema import UniqueConstraint
from sqlalchemy.types import Text, JSON, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from jsonschema import validate
import hashlib
import json
import enum
import os
import datetime
from ..manager import Manager


class ModuleType(enum.Enum):
    bible = "bible"


class ObjectType(enum.Enum):
    chapter_start = "cs"
    chapter_end = "ce"
    verse = "v"

    @classmethod
    def from_json(cls, obj):
        typ = obj["type"]
        if typ == "chapter-start":
            return ObjectType.chapter_start
        elif typ == "chapter-end":
            return ObjectType.chapter_end
        elif typ == "verse":
            return ObjectType.verse


class Language(enum.Enum):
    "ISO 639.3 codes"
    biblical_hebrew = "hbo"
    koine_greek = "ecg"
    english = "eng"


class Division(enum.Enum):
    first_testament = "FT"  # AKA the Hebrew Bible, the "Old Testament"
    new_testament = "NT"


class Module:
    SCHEMA_PREFIX = "ex_v1"

    @staticmethod
    def make_entities(metadata, schema_name):
        entities = {}

        def mkt(name, *args, **kwargs):
            entities[name] = Table(name, metadata, *args, **kwargs, schema=schema_name)

        mkt(
            "module_info",
            Column(
                "id", Integer, nullable=False, primary_key=True
            ),  # but there will only ever be one row
            Column("type", Enum(ModuleType), nullable=True),
            Column("shortcode", Text, nullable=False),
            Column("name", Text, nullable=False),
            Column("url", Text, nullable=False),
            Column("description", Text, nullable=False),
            Column("language", Enum(Language), nullable=False),
            Column("input_sha256", String(64), nullable=True),
            Column(
                "date_created",
                DateTime(timezone=True),
                default=datetime.datetime.utcnow,
                nullable=False,
            ),
        )

        mkt(
            "book",
            Column(
                "id", Integer, nullable=False, primary_key=True
            ),  # monotonically increasing in canonical order
            Column("name", Text, nullable=False),
            Column("division", Enum(Division), nullable=False),
        )

        mkt(
            "input",
            Column(
                "id", Integer, nullable=False, primary_key=True
            ),  # monotonically increasing in canonical order
            Column("filename", Text, nullable=False),
            Column("sha256", String(64), nullable=False),
        )

        mkt(
            "object",
            Column("id", Integer, nullable=False, primary_key=True, autoincrement=True),
            Column(
                "book_id",
                ForeignKey(entities["book"].c.id),
                nullable=False,
                primary_key=True,
            ),
            Column("chapter", Integer, nullable=True),
            Column("verse", Integer, nullable=True),
            Column("type", Enum(ObjectType), nullable=False),
            Column(
                "linear_id", Integer, nullable=False
            ),  # this will monotonically increase in the book
            Column("content", JSONB, nullable=False),
            Index("i_book_chapter_verse", "book_id", "chapter", "verse", unique=True),
            UniqueConstraint("book_id", "linear_id"),
        )

        return entities

    def __init__(self, manager: Manager, metadata: MetaData, entities):
        self._manager = manager
        self._metadata = metadata
        self._entities = entities
        self._object_schema = self._load_object_schema()
        self._inputs = set()

    def _load_object_schema(self):
        schema_file = os.path.join(os.path.dirname(__file__), "v1_object.json")
        with open(schema_file) as fd:
            return json.load(fd)

    @classmethod
    def create(cls, manager: Manager, metadata: MetaData, entities, **kwargs):
        module_info = entities["module_info"]
        with manager.engine.connect() as conn:
            conn.execute(insert(module_info).values(id=0, **kwargs))
            conn.commit()
        return cls(manager, metadata, entities)

    def add_book(self, **kwargs):
        book = self._entities["book"]
        with self._manager.engine.connect() as conn:
            conn.execute(insert(book).values(**kwargs))
            conn.commit()

    def import_book_stream(self, linear_id, book_id, entities_iter):
        object = self._entities["object"]
        with self._manager.engine.connect() as conn:
            for obj in entities_iter:
                validate(obj, self._object_schema)
                conn.execute(
                    insert(object).values(
                        book_id=book_id,
                        chapter=obj.get("chapter"),
                        verse=obj.get("verse"),
                        type=ObjectType.from_json(obj),
                        linear_id=linear_id,
                        content=obj,
                    )
                )
                linear_id += 1
            conn.commit()
        return linear_id

    def open_and_log(self, fname, path):
        def sha256():
            h = hashlib.sha256()
            with open(fname, "rb") as fd:
                while True:
                    data = fd.read(1 << 16)
                    if not data:
                        break
                    h.update(data)
            return h.hexdigest()

        rel_fname = os.path.relpath(fname, path)
        if rel_fname not in self._inputs:
            self._inputs.add(rel_fname)
            input = self._entities["input"]
            with self._manager.engine.connect() as conn:
                conn.execute(insert(input).values(filename=rel_fname, sha256=sha256()))
                conn.commit()

        return open(fname, "r")

    def complete(self):
        with self._manager.engine.connect() as conn:
            input = self._entities["input"]
            stmt = select(input.c.sha256).order_by(input.c.filename)
            h = hashlib.sha256()
            for row in conn.execute(stmt):
                h.update(row[0].encode("utf8"))
            conn.commit()
            module_info = self._entities["module_info"]
            stmt = (
                update(module_info)
                .where(module_info.c.id == 0)
                .values(input_sha256=h.hexdigest())
            )
            conn.execute(stmt)
            conn.commit()
