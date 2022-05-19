import { DistinguishableColours } from "../colours/distinguishable";
import { WordPosition } from "../components/ScriptureAnnotation";
import { ScriptureBookChapters } from "../verseref/VerseRef";
import { ScriptureObject } from "./ScriptureAPI";

// from postgresql: https://github.com/postgres/postgres/blob/master/src/backend/snowball/stopwords/english.stop
const stopWords = new Set([
    "i",
    "me",
    "my",
    "myself",
    "we",
    "our",
    "ours",
    "ourselves",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "he",
    "him",
    "his",
    "himself",
    "she",
    "her",
    "hers",
    "herself",
    "it",
    "its",
    "itself",
    "they",
    "them",
    "their",
    "theirs",
    "themselves",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "these",
    "those",
    "am",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
    "do",
    "does",
    "did",
    "doing",
    "a",
    "an",
    "the",
    "and",
    "but",
    "if",
    "or",
    "because",
    "as",
    "until",
    "while",
    "of",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "in",
    "out",
    "on",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "should",
    "now",
    // additions to Postgres list for common scriptural words
    "said",
    "say",
    "speak",
    "know",
    "speak",
    "becaus",
    "doe",
    "us",
    "may",
    "let",
    "also",
    "call",
    "sinc",
    "come",
    "came",
    "went",
    "like",
    "yet",
    "one",
    "o",
    "whi",
    "before",
    "took",
    "take",
]);

export const calculateSnowballHighlights = (column_scriptures: (readonly ScriptureObject[])[][]) => {
    const snowballCount = new Map<string, number>();

    for (const column of column_scriptures) {
        for (const objs of column) {
            for (const obj of objs) {
                if (obj.type !== "verse") {
                    continue; // we don't want to annotate footnotes or titles...
                }
                for (const word of obj.text) {
                    if (!word["s-snowball"]) {
                        continue;
                    }
                    if (!stopWords.has(word["s-snowball"])) {
                        snowballCount.set(word["s-snowball"], (snowballCount.get(word["s-snowball"]) || 0) + 1);
                    }
                }
            }
        }
    }

    // we prioritise the words with highest count, and then we sort alphabetically
    const sorted = Array.from(snowballCount.entries()).sort(([aw, ac], [bw, bc]) => {
        if (ac === bc) {
            return aw.localeCompare(bw);
        }
        return bc - ac;
    });
    const snowballHighlight = new Map<string, string>();

    for (let i = 0; i < sorted.length; i++) {
        if (i >= DistinguishableColours.length) {
            break;
        }
        const [snowball, count] = sorted[i];
        if (count > 1) {
            snowballHighlight.set(snowball, DistinguishableColours[i]);
        }
    }

    return snowballHighlight;
};

export const calculateSnowballAnnotations = (
    shortcode: string,
    sbcs: ScriptureBookChapters,
    scriptures: (readonly ScriptureObject[])[],
    snowballHighlight: Map<string, string>
) => {
    const result: Array<[WordPosition, string]> = [];
    for (let i = 0; i < scriptures.length; i++) {
        const book = sbcs[i].book;
        const objs = scriptures[i];
        if (!objs) {
            continue;
        }
        for (const obj of objs) {
            if (obj.type !== "verse") {
                continue; // we don't want to annotate footnotes or titles...
            }
            for (let wi = 0; wi < obj.text.length; wi++) {
                const word = obj.text[wi];
                const snowball = word["s-snowball"];
                if (snowball) {
                    const highlight = snowballHighlight.get(snowball);
                    if (highlight) {
                        result.push([
                            {
                                shortcode: shortcode,
                                book: book,
                                chapter: obj.chapter_start,
                                verse: obj.verse_start,
                                index: wi,
                            },
                            highlight,
                        ]);
                    }
                }
            }
        }
    }
    return result;
};
