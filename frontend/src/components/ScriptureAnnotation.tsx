export interface WordPosition {
    shortcode: string;
    book: string;
    chapter: number;
    verse: number;
    index: number;
}

export interface ScriptureWordAnnotation {
    preText: string;
    postText: string;
    source: string;
    paraSkip: number; // the number of blank paragraphs to insert prior to this word
    display: string;
    highlight: string;
}

export const newScriptureWordAnnotation = (): ScriptureWordAnnotation => {
    return {
        postText: "",
        preText: "",
        source: "",
        paraSkip: 0,
        display: "",
        highlight: "",
    };
};

export type ScriptureWordAnnotationFunctions = {
    get: () => [WordPosition, ScriptureWordAnnotation][];
    set: (newAnnotation: [WordPosition, ScriptureWordAnnotation][]) => void;
};

export const annoKey = (p: WordPosition) => {
    return JSON.stringify([p.shortcode, p.book, p.chapter, p.verse, p.index]);
};
