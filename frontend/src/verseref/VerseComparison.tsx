import { ScriptureBookChapter } from "../scripture/ScriptureAPI";

export enum CompareResult {
    BEFORE = -1,
    EQUAL = 0,
    AFTER = 1,
}
export interface CV {
    chapter: number;
    verse: number;
}
export const cv_compare = (a: CV, b: CV): CompareResult => {
    if (a.chapter < b.chapter) {
        return CompareResult.BEFORE;
    } else if (a.chapter > b.chapter) {
        return CompareResult.AFTER;
    } else {
        if (a.verse < b.verse) {
            return CompareResult.BEFORE;
        } else if (a.verse > b.verse) {
            return CompareResult.AFTER;
        }
        return CompareResult.EQUAL;
    }
};
export const cv_start = (sbc: ScriptureBookChapter) => {
    return { chapter: sbc.chapter_start, verse: sbc.verse_start };
};
export const cv_end = (sbc: ScriptureBookChapter) => {
    return { chapter: sbc.chapter_end, verse: sbc.verse_end };
};
