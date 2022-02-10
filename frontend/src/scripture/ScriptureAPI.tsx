import axios from "axios";

export interface ScriptureWord {
    value: string;
    "c-strongs": boolean;
    language: string;
}

// typescript version of `v1_object.json`
export interface ScriptureObject {
    type: string;
    chapter_start: number;
    verse_start: number;
    chapter_end: number;
    verse_end: number;
    text: ScriptureWord[];
    poetry: boolean;
    quote: boolean;
}

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

export const getScripture = async (params: ScriptureParams): Promise<ScriptureObject[] | null> => {
    try {
        const url = `/api/v1/scripture/verses/${params.shortcode}/${params.book}`;
        const resp = await axios.get<ScriptureObject[]>(url, { params: params });
        return resp.data;
    } catch (error: any) {
        return null;
    }
};
