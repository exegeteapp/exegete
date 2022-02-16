import { ModuleInfo } from "../scripture/ScriptureCatalog";
import generateAbbreviations from "./BookAbbreviations";
import P from "parsimmon";

const makeBookLookup = (module: ModuleInfo) => {
    const book_abbrevs = generateAbbreviations(module);

    // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

    const book_matchers = new Array<P.Parser<string>>();
    book_abbrevs.forEach((abbrevs_set: Set<string>, book: string) => {
        const abbrevs = Array.from(abbrevs_set);
        abbrevs.sort((a, b) => b.length - a.length);
        const book_re = new RegExp(`(${abbrevs.map(escapeRegExp).join("|")})`, "i");
        book_matchers.push(P.regexp(book_re).result(book));
    });

    return P.alt(...book_matchers);
};

interface RefNumber {
    n: number;
    opts: string;
}

export type AbsoluteScriptureRef =
    | { type: "ref"; abs: true; to: "book"; book: string }
    | {
          type: "ref";
          abs: true;
          to: "book_chapter";
          book: string;
          chapter: RefNumber;
      }
    | {
          type: "ref";
          abs: true;
          to: "book_chapter_verse";
          book: string;
          chapter: RefNumber;
          verse: RefNumber;
      };

export type ContextualScriptureRef =
    | {
          type: "ref";
          abs: false;
          to: "chapter_verse";
          chapter: RefNumber;
          verse: RefNumber;
      }
    | { type: "ref"; abs: false; to: "chapter_or_verse"; value: RefNumber };

export type ScriptureRef = AbsoluteScriptureRef | ContextualScriptureRef;

export type ScriptureToken = { type: "op"; value: string } | ScriptureRef;

export const makeLanguage = (module: ModuleInfo) => {
    const bl = makeBookLookup(module);

    let lang = P.createLanguage<{
        value: ScriptureToken[];
        eof_sep_refs: ScriptureToken[] | undefined;
        sep_refs: ScriptureToken[];
        book_ref_value: ScriptureToken;
        ref_value: ScriptureToken;
        b_c_v: ScriptureToken;
        b_c: ScriptureToken;
        c_v: ScriptureToken;
        b: ScriptureToken;
        c_or_v: ScriptureToken;
        ref_number: RefNumber;
        book: string;
    }>({
        value: (r) =>
            P.seqMap(r.book_ref_value, r.eof_sep_refs, (r1, other_refs) => {
                return [r1, ...(other_refs || [])];
            }),

        eof_sep_refs: (r) => P.alt(P.eof, r.sep_refs),
        sep_refs: (r) =>
            P.seqMap(
                P.alt(
                    P.regex(/\s*-\s*/).result<ScriptureToken>({ type: "op", value: "-" }),
                    P.regex(/\s*;\s*/).result<ScriptureToken>({ type: "op", value: ";" }),
                    P.regex(/\s*,\s*/).result<ScriptureToken>({ type: "op", value: "," })
                ).desc("range"),
                r.ref_value,
                P.alt(P.eof, r.sep_refs),
                (op: ScriptureToken, ref, other_refs) => {
                    return [op, ref, ...(other_refs || [])];
                }
            ),

        book_ref_value: (r) => P.alt(r.b_c_v, r.b_c, r.b),
        ref_value: (r) => P.alt(r.b_c_v, r.b_c, r.c_v, r.b, r.c_or_v),
        b_c_v: (r) =>
            P.seqMap(
                r.book.skip(P.whitespace),
                r.ref_number.skip(P.optWhitespace),
                P.alt(P.string(":"), P.string(".")).skip(P.optWhitespace),
                r.ref_number,
                (b, c, _, v) => ({
                    type: "ref",
                    abs: true,
                    to: "book_chapter_verse",
                    book: b,
                    chapter: c,
                    verse: v,
                })
            ),
        b_c: (r) =>
            P.seqMap(r.book.skip(P.whitespace), r.ref_number, (b, c) => ({
                type: "ref",
                abs: true,
                to: "book_chapter",
                book: b,
                chapter: c,
            })),
        c_v: (r) =>
            P.seqMap(
                r.ref_number.skip(P.optWhitespace),
                P.alt(P.string(":"), P.string(".")).skip(P.optWhitespace),
                r.ref_number,
                (c, _, v) => ({
                    type: "ref",
                    abs: false,
                    to: "chapter_verse",
                    chapter: c,
                    verse: v,
                })
            ),
        b: (r) => r.book.map((b) => ({ type: "ref", abs: true, to: "book", book: b })),
        c_or_v: (r) =>
            r.ref_number.map((v) => ({
                type: "ref",
                abs: false,
                to: "chapter_or_verse",
                value: v,
            })),

        ref_number: () =>
            P.seqMap(P.regexp(/[1-9][0-9]*/), P.optWhitespace, P.regex(/(ff|f|)/), (n, _, opts) => ({
                n: parseInt(n),
                opts: opts,
            })).desc("number"),
        book: (r) => bl.desc("book"),
    });

    return lang;
};
