import argparse
import os
from collections import defaultdict
from exegete.text import one
from exegete.text.cleanup import clean_words
from exegete.text.library import Manager
from exegete.text.library.schema import v1
from lxml import etree


def sblgnt_ingest(path):
    manager = Manager()
    mod = manager.create_module(
        v1.Module,
        type=v1.ModuleType.bible,
        name="SBL Greek New Testament",
        shortcode="SBLGNT",
        language=v1.Language.koine_greek,
        license_url="https://sblgnt.com/license/",
        license_text="""\
End User License Agreement

SBL Greek New Testament

Copyright 2010 by the Society of Biblical Literature and Logos Bible Software.

You may freely distribute the SBL Greek New Testament (SBLGNT), but you are not permitted to sell it on its own, either in print or electronic format.

If the SBLGNT constitutes less than 25 percent of the content of a larger print or electronic work, you may sell it as part of that work. If the SBLGNT will constitute more than 25 percent of the content of a larger print or electronic work that you wish to sell, you must secure written permission or secure a licensing agreement to do so prior to publication. All permissions and licensing requests should be addressed to:

    Rights and Permissions Office
    Society of Biblical Literature
    825 Houston Mill Road, Suite 350
    Atlanta, GA 30329 USA

If you give away the SBLGNT for use with a commercial product or sell a print or electronic work containing more than 500 verses from the SBLGNT, you must annually report the number of units sold, distributed, and/or downloaded to the Society of Biblical Literature’s Rights and Permissions Office.

You must always attribute quotations from the SBLGNT. If you quote fewer than 100 verses of the SBLGNT in a single print or electronic work, you can attribute it by simply adding "SBLGNT" after the quotation. Use of 100 or more verses in a single work must be accompanied by the following statement:

    Scripture quotations marked SBLGNT are from the SBL Greek New Testament. Copyright © 2010 Society of Biblical Literature and Logos Bible Software.

With online or electronic quotations, link "SBLGNT" and "SBL Greek New Testament" to http://sblgnt.com, "Society of Biblical Literature" to http://www.sbl-site.org, and "Logos Bible Software" to http://www.logos.com.

The SBLGNT may not be used in a Greek-English diglot without a license, regardless of whether such work will be sold or given away. Diglots containing the SBLGNT and a language other than English may be produced for free distribution.
""",
        url="https://sblgnt.com",
        description="Logos Bible Software and the Society of Biblical Literature are pleased to announce the release of a new, critically edited Greek New Testament.",
    )

    def get_gnt_etree():
        with mod.open_and_log(os.path.join(path, "sblgnt.xml"), path) as fd:
            return etree.parse(fd)

    def get_gntapp_etree():
        with mod.open_and_log(os.path.join(path, "sblgntapp.xml"), path) as fd:
            return etree.parse(fd)

    def make_books():
        et = get_gnt_etree()
        title_id = {}
        for book_id, book_elem in enumerate(et.xpath("/sblgnt/book")):
            first_verse = book_elem.xpath("./p/verse-number")[0]
            long_name = str(first_verse.get("id")).rsplit(" ", 1)[0].strip()
            mod.add_book(id=book_id, division=v1.Division.new_testament, name=long_name)
            title = one(book_elem.xpath("./title"))
            title_id[one(title.xpath("./text()"))] = book_id
        return title_id

    def parse_verse_id(s):
        book, chapter_verse = s.rsplit(" ", 1)
        chapter, verse = chapter_verse.rsplit(":", 1)
        # the verse might have a range
        if "-" in verse:
            verse_start, verse_end = verse.split("-")
        else:
            verse_start = verse_end = verse
        return book, int(chapter), int(verse_start), int(verse_end)

    def load_book(book_elem, book_id, apparatus):
        def verse_state_nonempty(verse_state):
            return any(verse_state[t] for t in ("chapter", "verse_start", "words"))

        def verse_state_blank():
            return {
                "chapter": None,
                "verse_start": None,
                "verse_end": None,
                "words": [],
            }

        def state_to_verse_and_footnotes(verse_state):
            obj = {"type": "verse", "text": clean_words(verse_state["words"])}

            # the shorter ending of Mark hasn't got a chapter or verse address
            if verse_state["chapter"] is not None:
                obj["chapter_start"] = obj["chapter_end"] = verse_state["chapter"]
            if verse_state["verse_start"] is not None:
                obj["verse_start"] = verse_state["verse_start"]
            if verse_state["verse_end"] is not None:
                obj["verse_end"] = verse_state["verse_end"]
            yield obj
            # look up any footnotes
            footnote_key = (book_id, obj.get("chapter_end"), obj.get("verse_end"))
            if footnote_key in apparatus:
                yield from apparatus.pop(footnote_key)

        def handle_p(p_node, verse_state):
            # if we have a current verse, insert a whitespace word into the
            # word stream for the <p> that just started
            if verse_state_nonempty(verse_state):
                verse_state["words"].append({"value": " "})

            for node in p_node.xpath("./*"):
                assert len(node.xpath("./*")) == 0
                if node.tag == "verse-number":
                    if verse_state_nonempty(verse_state):
                        yield from state_to_verse_and_footnotes(verse_state)
                    verse_state = verse_state_blank()
                    (
                        _,
                        verse_state["chapter"],
                        verse_state["verse_start"],
                        verse_state["verse_end"],
                    ) = parse_verse_id(node.get("id"))
                elif node.tag == "w":
                    verse_state["words"].append(
                        {"value": "".join(node.xpath("./text()"))}
                    )
                elif node.tag == "prefix":
                    verse_state["words"].append(
                        {
                            "value": "".join(node.xpath("./text()")),
                        }
                    )
                elif node.tag == "suffix":
                    verse_state["words"].append(
                        {
                            "value": "".join(node.xpath("./text()")),
                        }
                    )
                else:
                    raise Exception(node)
            return verse_state

        verse_state = verse_state_blank()
        for node in book_elem.xpath("./*"):
            if node.tag == "title" or node.tag == "mark-end":
                if verse_state_nonempty(verse_state):
                    yield from state_to_verse_and_footnotes(verse_state)
                verse_state = verse_state_blank()
                yield {
                    "type": "title",
                    "text": clean_words([{"value": "".join(node.xpath(".//text()"))}]),
                }
            elif node.tag == "p":
                verse_state = yield from handle_p(node, verse_state)
            else:
                raise Exception(node)

    def load_books(apparatus):
        et = get_gnt_etree()
        for book_id, book_elem in enumerate(et.xpath("/sblgnt/book")):
            mod.import_book_stream(0, book_id, load_book(book_elem, book_id, apparatus))

    def load_apparatus(title_id):
        apparatus = defaultdict(list)

        def make_words(nodes, attrs):
            buf = []
            for t in nodes:
                typ = type(t)
                if typ is etree._ElementUnicodeResult or typ is str:
                    text = str(t)
                    buf.append(attrs | {"value": text})
                elif typ is etree._Element and t.tag == "b":
                    buf += clean_words(make_words(t.xpath("./child::node()"), attrs))
                else:
                    raise Exception([t, typ])
            return buf

        def handle_p(book_id, p_node):
            # each `p` should be a footnote starting with a verse number
            nodes = p_node.xpath("./child::node()")
            assert nodes[0].tag == "verse-number"
            _, chapter, verse_start, verse_end = parse_verse_id(nodes[0].get("id"))
            apparatus[(book_id, chapter, verse_end)].append(
                {
                    "type": "footnote",
                    "chapter_start": chapter,
                    "chapter_end": chapter,
                    "verse_start": verse_start,
                    "verse_end": verse_end,
                    "text": clean_words(make_words(nodes[1:], {})),
                }
            )

        et = get_gntapp_etree()
        for book_elem in et.xpath("/sblgntapp/book"):
            title = one(book_elem.xpath("./title"))
            book_id = title_id[one(title.xpath("./text()"))]
            for node in book_elem.xpath("./*"):
                if node.tag == "title":
                    pass
                elif node.tag == "p":
                    handle_p(book_id, node)
                else:
                    raise Exception(node)

        return apparatus

    title_id = make_books()
    apparatus = load_apparatus(title_id)
    load_books(apparatus)
    mod.complete()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    args = parser.parse_args()
    sblgnt_ingest(args.path)


if __name__ == "__main__":
    main()
