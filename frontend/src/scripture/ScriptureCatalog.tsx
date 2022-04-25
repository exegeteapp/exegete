export interface VerseInfo {
    first: number;
    last: number;
    gaps: number[];
}

export interface ChapterInfo {
    chapter: number;
    verses: VerseInfo;
}

export interface BookInfo {
    division: string;
    name: string;
    chapters: ChapterInfo[];
}

export interface ModuleInfo {
    type: string;
    language: string;
    date_created: string;
    name: string;
    license_text: string;
    license_url: string;
    url: string;
    description: string;
    books: BookInfo[];
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
    [index: string]: ModuleInfo;
}
