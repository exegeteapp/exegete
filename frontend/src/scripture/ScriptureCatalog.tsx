export interface VerseInfo {
    readonly first: number;
    readonly last: number;
    readonly gaps: ReadonlyArray<number>;
}

export interface ChapterInfo {
    readonly chapter: number;
    readonly verses: VerseInfo;
}

export interface BookInfo {
    readonly division: string;
    readonly name: string;
    readonly chapters: ReadonlyArray<ChapterInfo>;
}

export interface ModuleInfo {
    readonly type: string;
    readonly language: string;
    readonly date_created: string;
    readonly name: string;
    readonly license_text: string;
    readonly license_url: string;
    readonly url: string;
    readonly description: string;
    readonly books: ReadonlyArray<BookInfo>;
}

export const FindBook = (module: ModuleInfo, name: string): BookInfo | undefined => {
    return module.books.find((b) => b.name === name);
};

export const BookRange = (module: ModuleInfo, from_book: string, to_book: string): BookInfo[] => {
    const matches: BookInfo[] = [];
    let in_range = false;
    for (const book of module.books) {
        if (book.name === from_book) {
            in_range = true;
        }
        if (in_range) {
            matches.push(book);
        }
        if (book.name === to_book) {
            in_range = false;
        }
    }
    return matches;
};

export const FindChapter = (book: BookInfo, chapter: number): ChapterInfo | undefined => {
    return book.chapters.find((c) => c.chapter === chapter);
};

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
