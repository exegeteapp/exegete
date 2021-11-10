from exegete.text.library.manager import Manager
from exegete.text.library.schema.v1 import Module as V1Module
from exegete.settings import settings
from exegete.api.database import database
import sqlalchemy


class ScriptureCatalog:
    """
    this is an app-wide singleton
    """

    def __init__(self):
        self.schemas = Manager().list_modules(V1Module)
        self.schema_entities = {
            schema: Manager.module_entities(V1Module, schema) for schema in self.schemas
        }
        self.shortcode_schema = self.build_shortcode_schema()
        self.shortcode_book = self.build_shortcode_book()

    def build_shortcode_schema(self):
        engine = settings.create_engine()
        res = {}
        with engine.connect() as conn:
            for schema in self.schemas:
                ent = self.schema_entities[schema]
                module_info = ent["module_info"]
                obj = conn.execute(sqlalchemy.select(module_info)).one()._asdict()
                res[obj["shortcode"]] = schema
        return res

    def build_shortcode_book(self):
        engine = settings.create_engine()
        res = {}
        with engine.connect() as conn:
            for schema in self.schemas:
                ent = self.schema_entities[schema]
                module_info = ent["module_info"]
                book = ent["book"]
                obj = conn.execute(sqlalchemy.select(module_info)).one()._asdict()
                shortcode = obj["shortcode"]
                for row in conn.execute(
                    sqlalchemy.select(book).order_by(book.columns["id"])
                ):
                    book_obj = row._asdict()
                    res[(shortcode, book_obj["name"])] = ent, book_obj["id"]
        return res

    def make_toc(self):
        "not async as only run once on application startup"
        engine = settings.create_engine()
        with engine.connect() as conn:

            def row_fields(row, fields):
                obj = row._asdict()
                return {field: obj[field] for field in fields}

            def distinct_field(q):
                return set(
                    t[0]
                    for t in conn.execute(
                        q.distinct(),
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
                    {"chapter": chapter, "verses": verses(schema, book_id, chapter)}
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
                    conn.execute(sqlalchemy.select(module_info)).one(),
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

            return dict(schema_toc(schema) for schema in self.schemas)

    async def get_scripture(
        self, shortcode, book, chapter_start, verse_start, chapter_end, verse_end
    ):
        if (shortcode, book) not in self.shortcode_book:
            raise KeyError(f"{shortcode} {book}")
        ent, book_id = self.shortcode_book[(shortcode, book)]
        object = ent["object"]
        bk = object.columns["book_id"]
        cs = object.columns["chapter_start"]
        ce = object.columns["chapter_end"]
        vs = object.columns["verse_start"]
        ve = object.columns["verse_end"]
        li = object.columns["linear_id"]

        q = (
            sqlalchemy.select(object)
            .filter(bk == book_id)
            .filter(sqlalchemy.and_(cs >= chapter_start, cs <= chapter_end))
            .filter(sqlalchemy.and_(vs >= verse_start, vs <= verse_end))
            .order_by(li)
        )
        res = await database.fetch_all(q)
        return res


catalog = ScriptureCatalog()
