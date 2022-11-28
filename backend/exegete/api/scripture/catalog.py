from exegete.api.db import async_engine, sync_engine
from exegete.text.library.manager import Manager
from exegete.text.library.schema.v1 import Module as V1Module
import sqlalchemy


class InvalidReference(Exception):
    pass


class ScriptureCatalog:
    """
    this is an app-wide singleton
    """

    @classmethod
    def create(cls):
        "not async as only run once on application startup"

        def build_shortcode_schema():
            res = {}
            with sync_engine.connect() as conn:
                for schema in self.schemas:
                    ent = self.schema_entities[schema]
                    module_info = ent["module_info"]
                    obj = (conn.execute(sqlalchemy.select(module_info))).one()._asdict()
                    res[obj["shortcode"]] = schema
            return res

        def build_shortcode_book():
            res = {}
            with sync_engine.connect() as conn:
                for schema in self.schemas:
                    ent = self.schema_entities[schema]
                    module_info = ent["module_info"]
                    book = ent["book"]
                    obj = (conn.execute(sqlalchemy.select(module_info))).one()._asdict()
                    shortcode = obj["shortcode"]
                    for row in conn.execute(
                        sqlalchemy.select(book).order_by(book.columns["id"])
                    ):
                        book_obj = row._asdict()
                        res[(shortcode, book_obj["name"])] = ent, book_obj["id"]
            return res

        self = ScriptureCatalog()
        self.schemas = Manager().list_modules(V1Module)
        self.schema_entities = {
            schema: Manager.module_entities(V1Module, schema) for schema in self.schemas
        }
        self.shortcode_schema = build_shortcode_schema()
        self.shortcode_book = build_shortcode_book()
        return self

    def make_toc(self):
        "not async as only run once on application startup"
        with sync_engine.connect() as conn:

            def row_fields(row, fields):
                obj = row._asdict()
                return {field: obj[field] for field in fields}

            def distinct_field(q):
                return set(
                    t[0]
                    for t in (
                        conn.execute(
                            q.distinct(),
                        )
                    ).all()
                    if t[0] is not None
                )

            def verses(schema, book_id, chapter):
                ent = self.schema_entities[schema]
                object = ent["object"]

                def q(f):
                    return (
                        sqlalchemy.select(object.columns[f])
                        .filter(object.columns["book_id"] == book_id)
                        .filter(
                            sqlalchemy.or_(
                                object.columns["chapter_start"] == chapter,
                                object.columns["chapter_end"] == chapter,
                            )
                        )
                    )

                verses = set(distinct_field(q("verse_start")))
                verses.update(set(distinct_field(q("verse_end"))))
                verse_list = sorted(verses)
                gaps = set(range(verse_list[0], verse_list[-1] + 1)) - verses
                return {
                    "first": verse_list[0],
                    "last": verse_list[-1],
                    "gaps": sorted(gaps),
                }

            def chapter_toc(schema, book_id):
                ent = self.schema_entities[schema]
                object = ent["object"]

                def q(f):
                    return sqlalchemy.select(object.columns[f]).filter(
                        object.columns["book_id"] == book_id
                    )

                chapters = set(distinct_field(q("chapter_start")))
                chapters.update(set(distinct_field(q("chapter_end"))))
                return [
                    {
                        "chapter": chapter,
                        "verses": verses(schema, book_id, chapter),
                    }
                    for chapter in sorted(chapters)
                ]

            def books_toc(schema):
                books = []
                ent = self.schema_entities[schema]
                book = ent["book"]
                for row in conn.execute(
                    sqlalchemy.select(book).order_by(book.columns["id"])
                ):
                    obj = row_fields(row, ["id", "division", "name"])
                    id = obj.pop("id")
                    obj["division"] = obj["division"].value
                    obj["chapters"] = chapter_toc(schema, id)
                    books.append(obj)
                return books

            def schema_toc(schema):
                ent = self.schema_entities[schema]
                module_info = ent["module_info"]
                obj = row_fields(
                    (conn.execute(sqlalchemy.select(module_info))).one(),
                    (
                        "shortcode",
                        "type",
                        "language",
                        "date_created",
                        "name",
                        "license_text",
                        "license_url",
                        "url",
                        "description",
                    ),
                )
                shortcode = obj.pop("shortcode")
                obj["type"] = obj["type"].value
                obj["language"] = obj["language"].value
                obj["date_created"] = str(obj["date_created"])
                obj["books"] = books_toc(schema)
                return shortcode, obj

            res = {}
            for schema in self.schemas:
                shortcode, obj = schema_toc(schema)
                res[shortcode] = obj
            return res

    async def get_scripture(
        self, shortcode, book, chapter_start, verse_start, chapter_end, verse_end
    ):
        "returns JSON encoded scripture"
        if (shortcode, book) not in self.shortcode_book:
            raise InvalidReference(f"{shortcode} {book}")
        ent, book_id = self.shortcode_book[(shortcode, book)]
        object = ent["object"]
        bk = object.columns["book_id"]
        cs = object.columns["chapter_start"]
        # FIXME: that `ce` and `ve` aren't used indicates a potential bug with
        # multi-verse or multi-chapter objects (which we don't actually have at
        # the moment.
        # ce = object.columns["chapter_end"]
        vs = object.columns["verse_start"]
        # ve = object.columns["verse_end"]
        li = object.columns["linear_id"]

        # a bit fiddly, we have four cases:
        #
        # we're in the start chapter and in the end chapter, so we need to
        # check both verse ranges...
        verse_cs_ce = (
            (cs == chapter_start)
            & (cs == chapter_end)
            & (vs >= verse_start)
            & (vs <= verse_end)
        )
        # ... or we're in the start chapter and not in the end chapter, so
        # we need to check the first verse range...
        verse_cs_not_ce = (
            (cs == chapter_start) & (cs < chapter_end) & (vs >= verse_start)
        )
        # ... or we're in the end chapter and not in the start chapter, so
        # we need to check the last verse range...
        verse_not_cs_ce = (cs > chapter_start) & (cs == chapter_end) & (vs <= verse_end)
        # ... or we're between the start and end chapter, so no need to
        # check verse ranges.
        verse_not_cs_not_ce = (cs > chapter_start) & (cs < chapter_end)

        subq = (
            sqlalchemy.select(
                object.columns["chapter_start"],
                object.columns["verse_start"],
                object.columns["chapter_end"],
                object.columns["verse_end"],
                object.columns["type"],
                object.columns["text"],
            )
            .filter(bk == book_id)
            .filter(
                sqlalchemy.or_(
                    verse_cs_ce,
                    verse_cs_not_ce,
                    verse_not_cs_ce,
                    verse_not_cs_not_ce,
                )
            )
            .order_by(li)
        ).subquery()

        q = sqlalchemy.select(
            sqlalchemy.cast(
                sqlalchemy.func.jsonb_agg(subq.table_valued()), sqlalchemy.String
            )
        ).select_from(subq)

        async with async_engine.connect() as conn:
            res = (await conn.execute(q)).one()
            return res[0]


__catalog_store = {}


def get_catalog_singleton():
    global __catalog_store
    if "c" not in __catalog_store:
        __catalog_store["c"] = ScriptureCatalog.create()
    return __catalog_store["c"]
