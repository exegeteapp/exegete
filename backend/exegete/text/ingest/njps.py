import os
import sys
from exegete.text import one
from io import StringIO

from exegete.text.cleanup import clean_words
from exegete.text.library import Manager
from exegete.text.library.schema import v1
from lxml import etree
import json
import argparse
import requests
import re


footnote_re = re.compile(r"^-?[a-z]{1,2}-?$")
expected_tags = set(["big", "br", "i", "small", "strong", "sup"])


def sefaria_parse(text):
    """
    parse Sefaria verse text, returning the verse string and one or more footnotes.
    Sefaria's HTML markup will be stripped from the text.
    """

    def elem_to_text(elem):
        assert elem.tag in expected_tags
        res = []

        # we don't want line breaks, but we do need spacing as Sefaria
        # sometimes has a <br> with no other spacing between two words.
        if elem.tag == "br":
            res.append(" ")

        for node in elem.xpath("./child::node()"):
            typ = type(node)
            if typ is etree._ElementUnicodeResult or typ is str:
                res.append(node)
            else:
                res += elem_to_text(node)

        return "".join(res)

    verse_text = ""
    footnotes = []

    html = etree.HTMLParser()
    et = etree.parse(StringIO(text), html)

    # blank verses, e.g. Joshua 21:36
    if text == "":
        return None, []

    body = one(et.xpath("/html/body"))

    # HTMLParser might stick in a <p> tag, which we want to skip through
    children = body.xpath("./child::node()")
    if (
        len(children) == 1
        and type(children[0]) is etree._Element
        and children[0].tag == "p"
    ):
        body = children[0]

    for elem in body.xpath("./child::node()"):
        typ = type(elem)

        if typ is etree._ElementUnicodeResult or typ is str:
            verse_text += elem
            continue

        assert elem.tag in expected_tags

        # we don't want to have to deal with nested footnotes, let's just assert
        # that there aren't any
        assert elem.xpath('.//*[@class="footnote"]') == []

        # tag for a footnote
        if elem.tag == "sup":
            sup_text = "".join(elem.xpath(".//text()"))
            if not footnote_re.match(sup_text):
                raise Exception("not a footnote: {}".format(sup_text))
            continue

        # handle <i> tags that are footnotes
        if elem.tag == "i":
            cls = elem.get("class")
            if cls == "endFootnote":
                # we can totally ignore this, it's just a hint to the sefaria frontend
                # with no content
                continue
            elif cls == "footnote":
                footnotes.append(elem_to_text(elem))
                continue

        # any other tag (including non-footnote <i>) - turn it into text
        verse_text += elem_to_text(elem)

    return verse_text, footnotes


books = {
    "Torah": [
        "Genesis",
        "Exodus",
        "Leviticus",
        "Numbers",
        "Deuteronomy",
    ],
    "Prophets": [
        "Joshua",
        "Judges",
        "I Samuel",
        "II Samuel",
        "I Kings",
        "II Kings",
        "Isaiah",
        "Jeremiah",
        "Ezekiel",
        "Hosea",
        "Joel",
        "Amos",
        "Obadiah",
        "Jonah",
        "Micah",
        "Nahum",
        "Habakkuk",
        "Zephaniah",
        "Haggai",
        "Zechariah",
        "Malachi",
    ],
    "Writings": [
        "Psalms",
        "Proverbs",
        "Job",
        "Song of Songs",
        "Ruth",
        "Lamentations",
        "Ecclesiastes",
        "Esther",
        "Daniel",
        "Ezra",
        "Nehemiah",
        "I Chronicles",
        "II Chronicles",
    ],
}


def fname(path, grouping, book):
    return os.path.join(path, "{}/{}.json".format(grouping, book))


def download(path):
    for grouping in books:
        for book in books[grouping]:
            outf = fname(path, grouping, book)
            tmpf = outf + ".tmp"
            response = requests.get(
                "https://www.sefaria.org/download/version/{} - en - Tanakh: The Holy Scriptures, published by JPS.json".format(
                    book
                )
            )
            if response.status_code != 200:
                raise Exception([book, response.status_code])
            with open(tmpf, "w") as fd:
                fd.write(response.text)
            os.rename(tmpf, outf)
            print("downloaded:", book)


def njps_ingest(path):
    manager = Manager()
    mod = manager.create_module(
        v1.Module,
        type=v1.ModuleType.bible,
        name="Tanakh: The Holy Scriptures, published by JPS",
        shortcode="NJPS",
        language=v1.Language.english,
        license_url="https://creativecommons.org/licenses/by-nc/4.0/",
        license_text="""\
Licensed under the Creative Commons CC-BY-NC license.
""",
        url="https://jps.org/books/tanakh-the-holy-scriptures-blue/",
        description="""\
Regarded throughout the English-speaking world as the standard English translation of the Holy Scriptures, the JPS TANAKH has been acclaimed by scholars, rabbis, lay leaders, Jews, and Christians alike.

The JPS TANAKH is an entirely original translation of the Holy Scriptures into contemporary English, based on the Masoretic (the traditional Hebrew) text. It is the culmination of three decades of collaboration by academic scholars and rabbis, representing the three largest branches of organized Judaism in the United States.

Not since the third century b.c.e., when 72 elders of the tribes of Israel created the Greek translation of Scriptures known as the Septuagint has such a broad-based committee of Jewish scholars produced a major Bible translation.

In executing this monumental task, the translators made use of the entire range of biblical interpretation, ancient and modern, Jewish and non-Jewish. They drew upon the latest findings in linguistics and archaeology, as well as the work of early rabbinic and medieval commentators, grammarians, and philologians. The resulting text is a triumph of literary style and biblical scholarship, unsurpassed in accuracy and clarity.""",
    )

    # Sefaria's names differ a bit from SBL standard
    fix_names = {
        "I Chronicles": "1 Chronicles",
        "II Chronicles": "2 Chronicles",
        "I Kings": "1 Kings",
        "II Kings": "2 Kings",
        "I Samuel": "1 Samuel",
        "II Samuel": "2 Samuel",
    }

    def make_books():
        book_to_id = {}
        book_id = 0
        for grouping in books:
            for book_id, book in enumerate(books[grouping], book_id + 1):
                book_to_id[book] = book_id
                mod.add_book(
                    id=book_id,
                    division=v1.Division.first_testament,
                    name=fix_names.get(book, book),
                )
        return book_to_id

    def load_book(json_file):
        with open(json_file) as fd:
            data = json.load(fd)

        print(json_file)
        for chapter, chapter_data in enumerate(data["text"], 1):
            for verse, text in enumerate(chapter_data, 1):
                try:
                    verse_text, footnotes = sefaria_parse(text)
                except:
                    print(json_file, chapter, verse, repr(text))
                    raise
                if verse_text is not None:
                    yield {
                        "type": "verse",
                        "chapter_start": chapter,
                        "chapter_end": chapter,
                        "verse_start": verse,
                        "verse_end": verse,
                        "text": clean_words([{"value": verse_text}], stem=True),
                    }
                for footnote in footnotes:
                    yield {
                        "type": "footnote",
                        "chapter_start": chapter,
                        "chapter_end": chapter,
                        "verse_start": verse,
                        "verse_end": verse,
                        "text": clean_words([{"value": footnote}], stem=True),
                    }

    def load_books():
        for grouping in books:
            for book in books[grouping]:
                json_file = fname(path, grouping, book)
                book_id = book_to_id[book]
                load_book(json_file)
                mod.import_book_stream(0, book_id, load_book(json_file))

    book_to_id = make_books()
    load_books()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--download", action="store_true")
    args = parser.parse_args()
    if args.download:
        download(args.path)
    njps_ingest(args.path)


if __name__ == "__main__":
    main()
