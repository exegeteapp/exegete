import { makeModuleParser, parseReference, ParseResultFailure, ParseResultSuccess } from "./VerseRef";
import testCatalog from "../testassets/TestCatalog";

const shortcode = "NET";
const module = testCatalog[shortcode];

const makeAndParseExpectingSuccess = (s: string): ParseResultSuccess => {
    const parser = makeModuleParser(module);
    const res = parseReference(module, parser, s);
    if (!res.success) {
        console.log(res);
    }
    expect(res.success).toBe(true);
    return res as ParseResultSuccess;
};

const makeAndParseExpectingFailure = (s: string): ParseResultFailure => {
    const parser = makeModuleParser(module);
    const res = parseReference(module, parser, s);
    if (res.success) {
        console.log(res);
    }
    expect(res.success).toBe(false);
    return res as ParseResultFailure;
};

test("empty string fails", () => {
    makeAndParseExpectingFailure("");
});

test("just whitespace fails", () => {
    makeAndParseExpectingFailure("   ");
});

test("book", () => {
    const res = makeAndParseExpectingSuccess("Matthew");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 1,
        chapter_end: 28,
        verse_end: 20,
    });
});

test("book range - two books", () => {
    const res = makeAndParseExpectingSuccess("Matthew - Mark");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 28,
            verse_end: 20,
        },
        {
            book: "Mark",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 16,
            verse_end: 20,
        },
    ]);
});

test("book comma operator", () => {
    const res = makeAndParseExpectingSuccess("Matthew,1 Corinthians");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 28,
            verse_end: 20,
        },
        {
            book: "1 Corinthians",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 16,
            verse_end: 24,
        },
    ]);
});

test("book semicolon operator", () => {
    const res = makeAndParseExpectingSuccess("Matthew;1 Corinthians");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 28,
            verse_end: 20,
        },
        {
            book: "1 Corinthians",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 16,
            verse_end: 24,
        },
    ]);
});

test("book comma comma", () => {
    makeAndParseExpectingFailure("Matthew,,1 Corinthians");
});

test("book comma semicolon", () => {
    makeAndParseExpectingFailure("Matthew,;1 Corinthians");
});

test("book semicolon semicolon", () => {
    makeAndParseExpectingFailure("Matthew;;1 Corinthians");
});

test("book range - torah", () => {
    const res = makeAndParseExpectingSuccess("Genesis - Deut");
    expect(res.sbcs.length).toBe(5);
    expect(res.sbcs).toMatchObject([
        {
            book: "Genesis",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 50,
            verse_end: 26,
        },
        {
            book: "Exodus",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 40,
            verse_end: 38,
        },
        {
            book: "Leviticus",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 27,
            verse_end: 34,
        },
        {
            book: "Numbers",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 36,
            verse_end: 13,
        },
        {
            book: "Deuteronomy",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 34,
            verse_end: 12,
        },
    ]);
});

test("book with whitespace in name", () => {
    const res = makeAndParseExpectingSuccess("1 Corinthians");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "1 Corinthians",
        chapter_start: 1,
        verse_start: 1,
        chapter_end: 16,
        verse_end: 24,
    });
});

test("book with unambiguous abbreviation", () => {
    const res = makeAndParseExpectingSuccess("Matthe");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 1,
        chapter_end: 28,
        verse_end: 20,
    });
    expect(makeAndParseExpectingSuccess("Matthe")).toMatchObject(res);
    expect(makeAndParseExpectingSuccess("Matth")).toMatchObject(res);
    expect(makeAndParseExpectingSuccess("Matt")).toMatchObject(res);
    expect(makeAndParseExpectingSuccess("Mat")).toMatchObject(res);
});

test("book with ambiguous abbreviation", () => {
    makeAndParseExpectingFailure("Ma");
    makeAndParseExpectingFailure("M");
});

test("book that does not exist", () => {
    makeAndParseExpectingFailure("My Little Pony");
});

test("unambiguous book with numerical abbreviation should not be accepted", () => {
    makeAndParseExpectingFailure("3 ");
    makeAndParseExpectingFailure("3");
});

test("book with trailing space", () => {
    makeAndParseExpectingSuccess("Matthew ");
});

test("book and chapter", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 1,
        chapter_end: 1,
        verse_end: 25,
    });
});

test("book and chapter range", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1-5");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 1,
        chapter_end: 5,
        verse_end: 48,
    });
});

test("book and chapter semicolon different book and chapter", () => {
    const res = makeAndParseExpectingSuccess("Matthew 3;1 John 2");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 3,
            verse_start: 1,
            chapter_end: 3,
            verse_end: 17,
        },
        {
            book: "1 John",
            chapter_start: 2,
            verse_start: 1,
            chapter_end: 2,
            verse_end: 29,
        },
    ]);
});

test("book and chapter semicolon same book", () => {
    const res = makeAndParseExpectingSuccess("Matthew 3;10");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 3,
            verse_start: 1,
            chapter_end: 3,
            verse_end: 17,
        },
        {
            book: "Matthew",
            chapter_start: 10,
            verse_start: 1,
            chapter_end: 10,
            verse_end: 42,
        },
    ]);
});

test("book and chapter comma different book and chapter", () => {
    const res = makeAndParseExpectingSuccess("Matthew 3,1 John 2");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 3,
            verse_start: 1,
            chapter_end: 3,
            verse_end: 17,
        },
        {
            book: "1 John",
            chapter_start: 2,
            verse_start: 1,
            chapter_end: 2,
            verse_end: 29,
        },
    ]);
});

test("book and chapter comma same book", () => {
    const res = makeAndParseExpectingSuccess("Matthew 3,10");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 3,
            verse_start: 1,
            chapter_end: 3,
            verse_end: 17,
        },
        {
            book: "Matthew",
            chapter_start: 10,
            verse_start: 1,
            chapter_end: 10,
            verse_end: 42,
        },
    ]);
});

test("book and book/chapter range", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1 - Mark 5");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 28,
            verse_end: 20,
        },
        {
            book: "Mark",
            chapter_start: 1,
            verse_start: 1,
            chapter_end: 5,
            verse_end: 43,
        },
    ]);
});

test("book and chapter (opt: f)", () => {
    const res = makeAndParseExpectingSuccess("Matthew 2f");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 2,
        verse_start: 1,
        chapter_end: 3,
        verse_end: 17,
    });
});

test("book and chapter (opt: ff)", () => {
    const res = makeAndParseExpectingSuccess("Matthew 2ff");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 2,
        verse_start: 1,
        chapter_end: 28,
        verse_end: 20,
    });
});

test("book and chapter and verse", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1:4");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 4,
        chapter_end: 1,
        verse_end: 4,
    });
});

test("book and chapter and verse dots", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1.4");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 4,
        chapter_end: 1,
        verse_end: 4,
    });
});

test("book and chapter and verse (opt: f)", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1:4f");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 4,
        chapter_end: 1,
        verse_end: 5,
    });
});

test("book and chapter and verse (opt: ff)", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1:4ff");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 1,
        verse_start: 4,
        chapter_end: 1,
        verse_end: 25,
    });
});

test("book and chapter to book and chapter and verse (opt: ff)", () => {
    const res = makeAndParseExpectingSuccess("Matthew 2:4-3:2ff");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 2,
        verse_start: 4,
        chapter_end: 3,
        verse_end: 17,
    });
});

test("book and chapter to book and chapter and verse (opt: ff at start)", () => {
    const res = makeAndParseExpectingSuccess("Matthew 2:4ff-3:9");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 2,
        verse_start: 4,
        chapter_end: 3,
        verse_end: 9,
    });
});

test("book and chapter to book and chapter and verse (opt: ff at start) dots", () => {
    const res = makeAndParseExpectingSuccess("Matthew 2.4ff-3.9");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 2,
        verse_start: 4,
        chapter_end: 3,
        verse_end: 9,
    });
});

test("book and chapter to book and chapter and verse", () => {
    const res = makeAndParseExpectingSuccess("Matthew 2-3:9");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 2,
        verse_start: 1,
        chapter_end: 3,
        verse_end: 9,
    });
});

test("book and chapter verse to invalid range [starting verse==0]", () => {
    makeAndParseExpectingFailure("Matthew 2:0");
});

test("book and chapter verse to invalid range [ending verse==0]", () => {
    makeAndParseExpectingFailure("Matthew 2:5-0");
});

test("book and chapter verse to invalid range [starting==ending verse==0]", () => {
    makeAndParseExpectingFailure("Matthew 2:0-0");
});

test("book and chapter verse to invalid range [verse limits reversed]", () => {
    makeAndParseExpectingFailure("Matthew 2:8-6");
});

test("book and chapter to invalid range [starting chapter==0]", () => {
    makeAndParseExpectingFailure("Matthew 0-4");
});

test("book and chapter to invalid range [starting==ending chapter==0]", () => {
    makeAndParseExpectingFailure("Matthew 4-0");
});

test("book and chapter to invalid range [chapter limits reversed]", () => {
    makeAndParseExpectingFailure("Matthew 8-6");
});

test("book and chapter verse to book and chapter verse", () => {
    const res = makeAndParseExpectingSuccess("Matthew 2:8-6:2");
    expect(res.sbcs.length).toBe(1);
    expect(res.sbcs[0]).toMatchObject({
        book: "Matthew",
        chapter_start: 2,
        verse_start: 8,
        chapter_end: 6,
        verse_end: 2,
    });
});

test("book and chapter and verse, comma", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1:4,6");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 4,
            chapter_end: 1,
            verse_end: 4,
        },
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 6,
            chapter_end: 1,
            verse_end: 6,
        },
    ]);
});

test("book and chapter and verse, semicolon chapter", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1:4;6");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 4,
            chapter_end: 1,
            verse_end: 4,
        },
        {
            book: "Matthew",
            chapter_start: 6,
            verse_start: 1,
            chapter_end: 6,
            verse_end: 34,
        },
    ]);
});

test("book and chapter and verse, semicolon chapter verse", () => {
    const res = makeAndParseExpectingSuccess("Matthew 1:4;6:2");
    expect(res.sbcs.length).toBe(2);
    expect(res.sbcs).toMatchObject([
        {
            book: "Matthew",
            chapter_start: 1,
            verse_start: 4,
            chapter_end: 1,
            verse_end: 4,
        },
        {
            book: "Matthew",
            chapter_start: 6,
            verse_start: 2,
            chapter_end: 6,
            verse_end: 2,
        },
    ]);
});
