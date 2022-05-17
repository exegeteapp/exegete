import { AnnotationArray } from "./Cells/Scripture";

export interface WordPosition {
    readonly shortcode: string;
    readonly book: string;
    readonly chapter: number;
    readonly verse: number;
    readonly index: number;
}

export interface ScriptureWordAnnotation {
    readonly preText: string;
    readonly postText: string;
    readonly source: string;
    readonly paraSkip: number; // the number of blank paragraphs to insert prior to this word
    readonly display: string;
    readonly highlight: string;
}

export const newScriptureWordAnnotation = (): ScriptureWordAnnotation => {
    return {
        postText: "",
        preText: "",
        source: "",
        paraSkip: 0,
        display: "",
        highlight: "",
    } as const;
};

export type ScriptureWordAnnotationFunctions = {
    get: () => AnnotationArray;
    set: (newAnnotation: [WordPosition, ScriptureWordAnnotation][]) => void;
};

export const annoKey = (p: WordPosition) => {
    return JSON.stringify([p.shortcode, p.book, p.chapter, p.verse, p.index]);
};
