from exegete.text.library.manager import Manager
from exegete.text.library.schema.v1 import Module as V1Module
from exegete.settings import settings
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

    def make_toc(self):
        "not async as only run once on application startup"

        engine = settings.create_engine()

        with engine.connect() as conn:

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
                    obj = row._asdict()
                    obj["division"] = obj["division"].value
                    obj["chapters"] = chapter_toc(schema, obj["id"])
                    books.append(obj)
                return books

            def schema_toc(schema):
                ent = self.schema_entities[schema]
                module_info = ent["module_info"]
                obj = conn.execute(sqlalchemy.select(module_info)).one()._asdict()
                obj["type"] = obj["type"].value
                obj["language"] = obj["language"].value
                obj["date_created"] = str(obj["date_created"])
                obj["books"] = books_toc(schema)
                return obj

            return {schema: schema_toc(schema) for schema in self.schemas}


catalog = ScriptureCatalog()
