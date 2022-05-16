import { AnnotationColours, WordPosition } from "../components/ScriptureAnnotation";
import { getScripture, ScriptureBookChapter } from "./ScriptureAPI";

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
]);

export const calculateSnowballHighlights = (shortcode_sbcs: [string, ScriptureBookChapter[]][]) => {
    const scripturePromises = [];

    for (const [shortcode, sbcs] of shortcode_sbcs) {
        for (const sbc of sbcs) {
            scripturePromises.push(getScripture({ ...sbc, shortcode }));
        }
    }

    return Promise.all(scripturePromises).then((scriptures) => {
        const snowballCount = new Map<string, number>();

        for (let i = 0; i < scriptures.length; i++) {
            const objs = scriptures[i];
            if (!objs) {
                continue;
            }
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

        const sorted = Array.from(snowballCount.entries()).sort((a, b) => b[1] - a[1]);
        const snowballHighlight = new Map<string, string>();

        for (let i = 0; i < AnnotationColours.length; i++) {
            const [snowball, count] = sorted[i];
            if (count > 1) {
                snowballHighlight.set(snowball, AnnotationColours[i]);
            }
        }

        return snowballHighlight;
    });
};

export const calculateSnowballAnnotations = (
    shortcode: string,
    sbcs: ScriptureBookChapter[],
    snowballHighlight: Map<string, string>
) => {
    const scripturePromises = sbcs.map((sbc) => getScripture({ ...sbc, shortcode: shortcode }));
    return Promise.all(scripturePromises).then((scriptures) => {
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
    });
};
