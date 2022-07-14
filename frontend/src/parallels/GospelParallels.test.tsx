import testCatalog from "../testassets/TestCatalog";
import { MakeGospelParallelsDatabase, ParallelSearch } from "./GospelParallels";

const shortcode = "NET";
const module = testCatalog[shortcode];

test("load the parallel database", () => {
    // this test exists to make sure that none of the thrown exceptions
    // are triggered, and so to catch any errors in the statically defined
    // database of parallel texts
    MakeGospelParallelsDatabase(module, shortcode);
});

test("match a search string (not a verse)", () => {
    const db = MakeGospelParallelsDatabase(module, shortcode);
    const res = ParallelSearch(module, shortcode, db, "temple");
    expect(res.length).toBe(3);
});

test("match a single verse", () => {
    const db = MakeGospelParallelsDatabase(module, shortcode);
    const res = ParallelSearch(module, shortcode, db, "Matthew 2:4");
    expect(res.length).toBe(1);
});

test("match a wide verse", () => {
    const db = MakeGospelParallelsDatabase(module, shortcode);
    const res = ParallelSearch(module, shortcode, db, "Matthew");
    expect(res.length).toBe(97);
});

test("match a left-straddling verse", () => {
    const db = MakeGospelParallelsDatabase(module, shortcode);
    const res = ParallelSearch(module, shortcode, db, "Matthew 1:26-2:1");
    expect(res.length).toBe(1);
});

test("match a right-straddling verse", () => {
    const db = MakeGospelParallelsDatabase(module, shortcode);
    const res = ParallelSearch(module, shortcode, db, "Matthew 2:11-15");
    expect(res.length).toBe(1);
});
