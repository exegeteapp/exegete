from django.core.management.base import BaseCommand, CommandError
from exegete.textapi.library.schema import v1
from exegete.textapi.library import Manager
from functools import reduce
from sqlalchemy.schema import MetaData
from glob import glob
from lxml import etree
from io import StringIO
import re
import os
import json


def netbible_ingest(path):
    manager = Manager()
    metadata = MetaData()
    mod = manager.create_module(
        v1.Module,
        type="bible",
        name="NET Bible®",
        shortcode="NET",
        language=v1.Language.english,
        url="https://netbible.com",
        description="The NET is the newest complete translation of the original biblical languages into English. In the mid-1990s, a multi-denominational team of more than twenty-five of the world’s foremost biblical scholars gathered around the shared vision of creating an English Bible translation that could overcome old challenges and boldly open the door for new possibilities. With the first edition completed in 2001, ongoing revisions based on scholarly and user feedback in 2003 and 2005, and a major update reaching its final stages in 2019, the NET’s unique translation process has yielded a beautiful, faithful English Bible for the worldwide church today.",
    )

    def make_books():
        # define the books of the NET Bible
        dir_id = {}
        book_id = 0
        for division in ("ot", "nt"):
            for bookdir in glob(os.path.join(path, division + "/*/")):
                peek_file = glob(os.path.join(bookdir, "*.json"))[0]
                with mod.open_and_log(peek_file, path) as fd:
                    peek = json.load(fd)[0]
                    book = peek["bookname"]
                dir_id[bookdir] = book_id
                if division == "nt":
                    division_enum = v1.Division.new_testament
                else:
                    division_enum = v1.Division.first_testament
                mod.add_book(id=book_id, division=division_enum, name=book)
                book_id += 1
        return dir_id

    def load_book(fname):
        with mod.open_and_log(fname, path) as fd:
            text = json.load(fd)

        yield {"type": "chapter-start", "chapter": int(text[0]["chapter"])}

        punctuation_re = re.compile(r"^[{}]+$".format(re.escape(". -–—¡!")))
        strongs_re = re.compile(r"^\d+[b]?$")
        parser = etree.HTMLParser()

        def process_node(node, attrs: dict, object_attrs: dict):
            typ = type(node)

            def recurse_process(extra):
                agg = []
                for words in [
                    process_node(t, attrs | extra, object_attrs)
                    for t in node.xpath("./child::node()")
                ]:
                    agg += words
                return agg

            if typ is etree._ElementUnicodeResult or typ is str:
                text = str(node)
                text_attrs = {"value": text}
                if punctuation_re.match(text):
                    text_attrs["punctuation"] = True
                return [attrs | text_attrs]

            if typ is etree._Element and node.tag == "st":
                codes = []
                for code in node.get("data-num").strip().split(" "):
                    assert strongs_re.match(code)
                    codes.append("{}".format(code))
                return recurse_process({"c-strongs": codes})

            # these are put in by LXML
            if typ is etree._Element and node.tag in ("html", "body"):
                return recurse_process({})

            if typ is etree._Element and node.tag == "p":
                class_text = node.get("class")
                if class_text:
                    classes = class_text.strip().split(" ")
                    for cls in classes:
                        if (
                            cls == "bodytext"
                            or cls == "bodyblock"
                            or cls == "paragraphtitle"
                            or cls == "psasuper"  # prelude for a Psalm
                            or cls
                            == "lamhebrew"  # ignore as there'll be a <span class="hebrew">..</span>
                            or cls
                            == "sosspeaker"  # ignore as <strong>...</strong> also present
                        ):
                            pass
                        elif (
                            cls == "poetry" or cls == "poetrybreak" or cls == "otpoetry"
                        ):
                            object_attrs["poetry"] = True
                        elif cls == "quote":
                            object_attrs["quote"] = True
                        else:
                            raise Exception(cls)
                return recurse_process({})

            if typ is etree._Element and node.tag == "span":
                span_attrs = {}
                class_text = node.get("class")
                if class_text:
                    classes = class_text.strip().split(" ")
                    for cls in classes:
                        if cls == "smcaps":
                            span_attrs["small-caps"] = True
                        elif cls == "hebrew":
                            span_attrs["language"] = "hbo"
                        else:
                            raise Exception(cls)
                return recurse_process(span_attrs)

            if typ is etree._Element and node.tag == "b":
                return recurse_process({"strong": True})

            if typ is etree._Element and node.tag == "i":
                return recurse_process({"em": True})

            if typ is etree._Element and node.tag == "sup":
                return recurse_process({"superscript": True})

            if typ is etree._Element and node.tag == "n":
                # skip footnotes, they are not included in the free version of the NET Bible
                return []

            if typ is etree._Element and node.tag == "br":
                return [{"value": "", "br": True}]

            raise Exception((node, type(node)))

        # each file is a chapter, consisting of a list of (chapter, verse) addressed hunks of marked up text
        for hunk in text:
            words = []
            if hunk["text"] != "":
                et = etree.parse(StringIO(hunk["text"]), parser)
                nodes = et.xpath("/child::node()")
                if len(nodes) == 0:
                    raise Exception([hunk, nodes, len(nodes)])

            else:
                # Acts 24:7 ruins everything
                nodes = [""]

            # object level attributes such as the poetry flag; these are scoped to the whole object, not
            # particular words
            object_attrs = {}
            for node in nodes:
                try:
                    words += process_node(node, {}, object_attrs)
                except Exception as e:
                    print(node)
                    raise e
            assert all(type(t) is dict for t in words)
            yield {
                "type": "verse",
                "chapter": int(hunk["chapter"]),
                "verse": int(hunk["verse"]),
                "text": words,
            }

        yield {"type": "chapter-end", "chapter": int(text[0]["chapter"])}

    def load_books(dir_id):
        for division in ("ot", "nt"):
            for bookdir in sorted(glob(os.path.join(path, division, "*/"))):
                book_id = dir_id[bookdir]
                linear_id = 0
                for fname in glob(os.path.join(bookdir, "*.json")):
                    linear_id = mod.import_book_stream(
                        linear_id, book_id, load_book(fname)
                    )

    dir_id = make_books()
    load_books(dir_id)
    mod.complete()


class Command(BaseCommand):
    help = "Ingests the NET Bible(R) into an exegete package"

    def add_arguments(self, parser):
        parser.add_argument("path")

    def handle(self, *args, **options):
        path = options["path"]
        netbible_ingest(path)
