from sqlalchemy import insert, Index, Enum, select, update
from sqlalchemy.schema import Table, Column, MetaData, ForeignKey
from sqlalchemy.sql.schema import UniqueConstraint
from sqlalchemy.sql.sqltypes import Boolean
from sqlalchemy.types import Text, JSON, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import func
from jsonschema import validate
import jsonschema
import hashlib
import json
import enum
import os
import datetime
from ..manager import Manager


class ModuleType(enum.Enum):
    bible = "bible"


class ObjectType(enum.Enum):
    verse = "v"
    title = "t"
    footnote = "f"

    @classmethod
    def from_json(cls, obj):
        typ = obj["type"]
        if typ == "verse":
            return ObjectType.verse
        elif typ == "title":
            return ObjectType.title
        elif typ == "footnote":
            return ObjectType.footnote
        else:
            raise Exception("invalid ObjectType: {}".format(typ))


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
            Column("type", Enum(ModuleType, schema=schema_name), nullable=True),
            Column("shortcode", Text, nullable=False),
            Column("name", Text, nullable=False),
            Column("license_text", Text, nullable=False),
            Column("license_url", Text, nullable=False),
            Column("url", Text, nullable=False),
            Column("description", Text, nullable=False),
            Column("language", Enum(Language, schema=schema_name), nullable=False),
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
            Column("division", Enum(Division, schema=schema_name), nullable=False),
        )

        mkt(
            "input",
            Column(
                "id", Integer, nullable=False, primary_key=True
            ),  # monotonically increasing in canonical order
            Column("filename", Text, nullable=False),
            Column("sha256", String(64), nullable=False),
        )

        plaintext = Column("plaintext", Text, nullable=False)
        mkt(
            "object",
            Column("id", Integer, nullable=False, primary_key=True, autoincrement=True),
            Column(
                "book_id",
                ForeignKey(entities["book"].c.id),
                nullable=False,
                primary_key=True,
            ),
            Column("chapter_start", Integer, nullable=True),
            Column("verse_start", Integer, nullable=True),
            Column("chapter_end", Integer, nullable=True),
            Column("verse_end", Integer, nullable=True),
            Column("type", Enum(ObjectType, schema=schema_name), nullable=False),
            Column(
                "linear_id", Integer, nullable=False
            ),  # this will monotonically increase in the book
            Column("text", JSONB, nullable=False),
            plaintext,
            UniqueConstraint("book_id", "linear_id"),
            Index(
                "index_bi_cs_ce_vs_ve",
                "book_id",
                "chapter_start",
                "chapter_end",
                "verse_start",
                "verse_end",
            ),
            Index(
                "index_plaintext_tsvector",
                func.to_tsvector("english", plaintext),
                postgresql_using="gin",
            ),
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
        def to_plaintext(text):
            return " ".join(t["value"] for t in text)

        object = self._entities["object"]
        with self._manager.engine.connect() as conn:
            for obj in entities_iter:
                try:
                    validate(obj, self._object_schema)
                except jsonschema.exceptions.ValidationError as e:
                    print("validation of this object failed: {}".format(obj))
                    raise e
                conn.execute(
                    insert(object).values(
                        book_id=book_id,
                        chapter_start=obj.get("chapter_start"),
                        verse_start=obj.get("verse_start"),
                        chapter_end=obj.get("chapter_end"),
                        verse_end=obj.get("verse_end"),
                        type=ObjectType.from_json(obj),
                        linear_id=linear_id,
                        text=obj.get("text"),
                        plaintext=to_plaintext(obj.get("text")),
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
