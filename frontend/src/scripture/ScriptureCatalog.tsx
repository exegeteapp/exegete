import { BookArray } from "verseref";

export interface ModuleInfo {
    readonly type: string;
    readonly language: string;
    readonly date_created: string;
    readonly name: string;
    readonly license_text: string;
    readonly license_url: string;
    readonly url: string;
    readonly description: string;
    readonly books: BookArray;
}

export const languageClass = (language: string) => {
    if (language === "ecg") {
        return "biblical-text-greek";
    } else if (language === "hbo") {
        return "biblical-text-hebrew";
    } else {
        return "biblical-text-english";
    }
};

export interface ScriptureCatalog {
    readonly [index: string]: ModuleInfo;
}
