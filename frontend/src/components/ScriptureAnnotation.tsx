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

export const AnnotationColours = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#000000",
    "#b15928",
];

export type ScriptureWordAnnotationFunctions = {
    get: () => [WordPosition, ScriptureWordAnnotation][];
    set: (newAnnotation: [WordPosition, ScriptureWordAnnotation][]) => void;
};

export const annoKey = (p: WordPosition) => {
    return JSON.stringify([p.shortcode, p.book, p.chapter, p.verse, p.index]);
};
