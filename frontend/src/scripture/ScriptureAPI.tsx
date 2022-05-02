import axios from "axios";

// typescript version of `v1_object.json`
export interface ScriptureWord {
    value: string;
    "c-strongs": string[] | undefined;
    "s-snowball": string | undefined;
    language: string;
}

export interface ScriptureObject {
    type: string;
    chapter_start: number;
    verse_start: number;
    chapter_end: number;
    verse_end: number;
    text: ScriptureWord[];
}
// end of `v1_object.json`

export interface ScriptureBookChapter {
    book: string;
    chapter_start: number;
    verse_start: number;
    chapter_end: number;
    verse_end: number;
}

export interface ScriptureParams extends ScriptureBookChapter {
    shortcode: string;
}

const CACHE_SIZE = 10;
let scriptureCache: [string, ScriptureObject[]][] = [];

const cache_key = (params: ScriptureParams): string => {
    return `${params.shortcode}_${params.book}_${params.chapter_start}_${params.verse_start}_${params.chapter_end}_${params.verse_end}`;
};

export const getScripture = async (params: ScriptureParams): Promise<ScriptureObject[] | null> => {
    const key = cache_key(params);
    const match = scriptureCache.find(([k]) => key === k);
    if (match) {
        return match[1];
    } else {
    }
    try {
        const url = `/api/v1/scripture/verses/${params.shortcode}/${params.book}`;
        const resp = await axios.get<ScriptureObject[]>(url, { params: params });
        scriptureCache.push([key, resp.data]);
        scriptureCache = scriptureCache.slice(-CACHE_SIZE);
        return resp.data;
    } catch (error: any) {
        return null;
    }
};
