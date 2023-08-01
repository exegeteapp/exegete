import axios from "axios";
import { ScriptureBookChapter } from "verseref/dist/Types";

// typescript version of `v1_object.json`
export interface ScriptureWord {
    readonly value: string;
    readonly "c-strongs": ReadonlyArray<string> | undefined;
    readonly "s-snowball": string | undefined;
    readonly "s-nopunct": string | undefined;
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

export interface ScriptureParams extends ScriptureBookChapter {
    readonly shortcode: string;
}

// scripture is small (kilobytes), and complicated exegesis might do lots of queries
let scriptureCache: [string, Promise<ScriptureObject[]>][] = [];

const cache_key = (params: ScriptureParams): string => {
    return `${params.shortcode}_${params.book}_${params.chapter_start}_${params.verse_start}_${params.chapter_end}_${params.verse_end}`;
};

export const getScripture = async (params: ScriptureParams): Promise<ScriptureObject[]> => {
    const make_promise = async () => {
        try {
            const { book, shortcode, ...range } = params;
            const url = `/api/v1/scripture/verses/${shortcode}/${book}`;
            const resp = await axios.get<ScriptureObject[]>(url, { params: range });
            return resp.data;
        } catch (error: any) {
            return [
                {
                    type: "error",
                    chapter_start: 0,
                    chapter_end: 0,
                    verse_start: 0,
                    verse_end: 0,
                    text: [],
                },
            ];
        }
    };

    const key = cache_key(params);
    const match = scriptureCache.find(([k]) => key === k);
    if (match) {
        return match[1];
    }
    const promise = make_promise();
    scriptureCache.push([key, promise]);
    return promise;
};
