import axios from "axios";

// typescript version of `v1_object.json`
export interface ScriptureWord {
    readonly value: string;
    readonly "c-strongs": ReadonlyArray<string> | undefined;
    readonly "s-snowball": string | undefined;
    readonly language: string;
}

export interface ScriptureObject {
    readonly type: string;
    readonly chapter_start: number;
    readonly verse_start: number;
    readonly chapter_end: number;
    readonly verse_end: number;
    readonly text: ReadonlyArray<ScriptureWord>;
}
// end of `v1_object.json`

export interface ScriptureBookChapter {
    readonly book: string;
    readonly chapter_start: number;
    readonly verse_start: number;
    readonly chapter_end: number;
    readonly verse_end: number;
}

export interface ScriptureParams extends ScriptureBookChapter {
    readonly shortcode: string;
}

// scripture is small (kilobytes), and complicated exegesis might do lots of queries
const CACHE_SIZE = 1024;
let scriptureCache: [string, ScriptureObject[]][] = [];

const cache_key = (params: ScriptureParams): string => {
    return `${params.shortcode}_${params.book}_${params.chapter_start}_${params.verse_start}_${params.chapter_end}_${params.verse_end}`;
};

export const getScripture = async (params: ScriptureParams): Promise<ReadonlyArray<ScriptureObject> | null> => {
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
