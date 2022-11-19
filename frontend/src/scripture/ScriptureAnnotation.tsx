import { AnnotationArray } from "../components/Cells/Scripture";

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

export const mergeAnnotation = (a: ScriptureWordAnnotation, b: ScriptureWordAnnotation): ScriptureWordAnnotation => {
    return {
        postText: b.postText ? b.postText : a.postText,
        preText: b.preText ? b.preText : a.preText,
        source: b.source ? b.source : a.source,
        paraSkip: b.paraSkip ? b.paraSkip : a.paraSkip,
        display: b.display ? b.display : a.display,
        highlight: b.highlight ? b.highlight : a.highlight,
    } as const;
};

export const mergeAnnotationArray = (below: AnnotationArray, above: AnnotationArray): AnnotationArray => {
    const annoMap = new Map<string, [WordPosition, ScriptureWordAnnotation]>();
    for (const [pos, anno] of below) {
        annoMap.set(annoKey(pos), [pos, anno]);
    }
    for (const [pos, anno] of above) {
        if (annoMap.has(annoKey(pos))) {
            const [, existing] = annoMap.get(annoKey(pos))!;
            annoMap.set(annoKey(pos), [pos, mergeAnnotation(existing, anno)]);
        } else {
            annoMap.set(annoKey(pos), [pos, anno]);
        }
    }

    return Array.from(annoMap).map(([key, [position, annotation]]) => [position, annotation]);
};
