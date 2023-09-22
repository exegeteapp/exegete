from exegete.text.library.schema import v1
from exegete.text.library import Manager
from exegete.text.cleanup import clean_words, introduce_spaces
import argparse
from glob import glob
from lxml import etree
from io import StringIO
import re
import os
import json


def netbible_ingest(path):
    manager = Manager()
    mod = manager.create_module(
        v1.Module,
        type=v1.ModuleType.bible,
        name="NET Bible®",
        shortcode="NET",
        language=v1.Language.english,
        license_url="https://netbible.com/copyright/",
        license_text="""\
THE NET BIBLE®, New English Translation (NET) 
Naming Convention:

    For verses quoted, in limited space situations the three letter abbreviation is: NET
    Alternately, the following may be used:
        NET Bible®
        NET
        Please avoid: New English Translation Bible or just New English Translation
    If you quote the NET Bible in your entire work in lieu of saying NET after each scripture you may include the following acknowledgement on your acknowledgement page
        "The Scriptures quoted are from the NET Bible® http://netbible.com copyright ©1996, 2019 used with permission from Biblical Studies Press, L.L.C. All rights reserved".

Quoting the NET BIBLE Text

- You may quote the NET BIBLE® verse text in:
1. Non Commercial Publication- The NET Bible® Scripture text (without the NET Bible notes) may be quoted in any form (written, visual, electronic, projection, or audio without written permission. This permission is contingent upon the quoted text being followed by the designation (NET) and an appropriate copyright acknowledgment: Scripture quoted by permission. Quotations designated (NET) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. http://netbible.com All rights reserved, and for audio production: an one will insert a audio acknowledgement clip that says "The Scriptures quoted are from the NET Bible® http://netbible.com copyright ©1996, 2019 used with permission from Biblical Studies Press, L.L.C. All rights reserved"

You may copy the NET Bible® and print it for others as long as you give it away, do not charge for it and comply with our guidelines for content control including current valid copyright and organizational acknowledgments. In this case, free means free. It cannot be bundled with anything sold, used as a gift to solicit donations, nor can you charge for shipping, handling, or anything. It is provided for personal study or for use in preparation of sermons, Sunday school classes, undergraduate or seminary religion classes or other noncommercial study.

You can download it at https://bible.org/downloads

1a. There has been a lot of interest in producing audio recordings of the NET Bible for local ministry user. Therefore a local ministry eg. Church is granted unlimited non-commercial rights to use the NET Bible text to make audio recordings. You can produce audio recordings of partial or complete books of the Bible (WORK) for free distribution on email and/or CD within the congregation, and as free MP3 downloads made available on the church website and the personal blogs of members of the church to be of benefit to the church at large.

1b. Church and mobile apps

    When the NET Bible is read or used in a sermon no royalty or prior permission is needed. We do request that if projected on the screen the abbreviation (NET) is requested.
    When quotations from the NET Bible® are used in mobile apps, youtube channels, free apps, Internet apps or not-for-sale media, such as church bulletins, orders of service, posters, Blogs, transparencies, projection or similar media. The abbreviation (NET) must be used at the end of the quotation. For software apps with internet access the term NET must be hyperlinked to http://netbible.org.

2. Commercial Publication -Please contact HarperCollins Christian Publishing licensing for more information.

    For  Gratis use of the NET in commercial publications see here

3-For permissions expressly not granted above inquire by e-mail permissions or write Biblical Studies Press..

    The names: THE NET BIBLE®, NEW ENGLISH TRANSLATION COPYRIGHT (c) 1996 BY BIBLICAL STUDIES PRESS, L.L.C. NET Bible® IS A  REGISTERED TRADEMARK THE NET BIBLE® LOGO, SERVICE MARK COPYRIGHT (c) 1997 BY BIBLICAL STUDIES PRESS, L.L.C. ALL RIGHTS RESERVED
    SATELLITE IMAGERY COPYRIGHT (c) RØHR PRODUCTIONS LTD. AND CENTRE NATIONAL D'ÉTUDES SPATIALES PHOTOGRAPHS COPYRIGHT (c) RØHR PRODUCTIONS LTD.
""",
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

        strongs_re = re.compile(r"^\d+[b]?$")
        parser = etree.HTMLParser()

        def process_node(node, attrs: dict, object_attrs: dict):
            typ = type(node)

            def process_children_with_attrs(extra):
                agg = []
                for words in [
                    process_node(t, attrs | extra, object_attrs)
                    for t in node.xpath("./child::node()")
                ]:
                    agg += words
                return agg

            if typ is etree._ElementUnicodeResult or typ is str:
                text = str(node)
                text_attrs = {"value": introduce_spaces(text)}
                return [attrs | text_attrs]

            if typ is etree._Element and node.tag == "st":
                codes = []
                for code in node.get("data-num").strip().split(" "):
                    assert strongs_re.match(code)
                    codes.append("{}".format(code))
                return process_children_with_attrs({"c-strongs": codes})

            # these are put in by LXML
            if typ is etree._Element and node.tag in ("html", "body"):
                return process_children_with_attrs({})

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
                            or cls == "poetry"
                            or cls == "poetrybreak"
                            or cls == "otpoetry"
                            or cls == "quote"
                        ):
                            pass
                        else:
                            raise Exception(cls)
                # insert some whitespace for the <p>
                return process_children_with_attrs({})

            if typ is etree._Element and node.tag == "span":
                span_attrs = {}
                class_text = node.get("class")
                if class_text:
                    classes = class_text.strip().split(" ")
                    for cls in classes:
                        if cls == "hebrew":
                            span_attrs["language"] = "hbo"
                        elif cls == "smcaps":
                            pass
                        else:
                            raise Exception(cls)
                return process_children_with_attrs(span_attrs)

            if typ is etree._Element and node.tag == "b":
                return process_children_with_attrs({})

            if typ is etree._Element and node.tag == "i":
                return process_children_with_attrs({})

            if typ is etree._Element and node.tag == "sup":
                return process_children_with_attrs({})

            if typ is etree._Element and node.tag == "n":
                # skip footnotes, they are not included in the free version of the NET Bible
                return []

            if typ is etree._Element and node.tag == "br":
                return []

            raise Exception((node, type(node)))

        # each file is a chapter, consisting of a list of (chapter, verse) addressed hunks of marked up text
        for hunk in text:
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
            words = []
            object_attrs = {}
            for node in nodes:
                try:
                    words += process_node(node, {}, object_attrs)
                except Exception as e:
                    print(node)
                    raise e
            assert all(isinstance(t, dict) for t in words)

            # exegete requires words to really be words, not multiple words, and not containing whitespace.
            # (we are focussed upon exegesis/analysis, not presentation)
            words = clean_words(words, stem=True)

            yield {
                "type": "verse",
                "chapter_start": int(hunk["chapter"]),
                "chapter_end": int(hunk["chapter"]),
                "verse_start": int(hunk["verse"]),
                "verse_end": int(hunk["verse"]),
                "text": words,
            }

    def load_books(dir_id):
        for division in ("ot", "nt"):
            for bookdir in sorted(glob(os.path.join(path, division, "*/"))):
                book_id = dir_id[bookdir]
                linear_id = 0
                for fname in sorted(glob(os.path.join(bookdir, "*.json"))):
                    linear_id = mod.import_book_stream(
                        linear_id, book_id, load_book(fname)
                    )

    dir_id = make_books()
    load_books(dir_id)
    mod.complete()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    args = parser.parse_args()
    netbible_ingest(args.path)


if __name__ == "__main__":
    main()
