export interface WordPosition {
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
}

export type ScriptureWordAnnotationFunctions = {
    get: () => [WordPosition, ScriptureWordAnnotation][];
    set: (newAnnotation: [WordPosition, ScriptureWordAnnotation][]) => void;
};
