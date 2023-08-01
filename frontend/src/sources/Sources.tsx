import { ModuleInfo } from "../scripture/ScriptureCatalog";
import { BookInfo } from "verseref/dist/Types";

export interface SourceDefinition {
    readonly description: string;
    readonly code: string; // this must unique among all sources, despite the groupings
    readonly colour: string;
}

export interface SourceGroup {
    readonly applicable: (module: ModuleInfo, book: BookInfo) => boolean;
    readonly name: string;
    readonly sources: ReadonlyArray<SourceDefinition>;
}

const groups: ReadonlyArray<SourceGroup> = [
    {
        applicable: (module, book) => {
            return (
                book.division === "NT" &&
                (book.name === "Matthew" || book.name === "Luke" || book.name === "Mark" || book.name === "John")
            );
        },
        name: "NT Gospel",
        sources: [
            { description: "Q", code: "Q", colour: "orange" },
            { description: "Mark", code: "Mk", colour: "red" },
            { description: "Matthew", code: "M", colour: "green" },
            { description: "Luke", code: "L", colour: "blue" },
        ],
    },
    {
        applicable: (module, book) => {
            return (
                book.division === "FT" &&
                (book.name === "Genesis" ||
                    book.name === "Exodus" ||
                    book.name === "Leviticus" ||
                    book.name === "Numbers" ||
                    book.name === "Deuteronomy")
            );
        },
        name: "Pentateuch",
        sources: [
            { description: "Jahwist", code: "J", colour: "red" },
            { description: "Elohist", code: "E", colour: "green" },
            { description: "Priestly", code: "P", colour: "orange" },
            { description: "Deuteronomist", code: "D", colour: "blue" },
            { description: "Non-P", code: "NP", colour: "#d35400" },
        ],
    },
];

export const applicableGroups = (module: ModuleInfo, books: Set<BookInfo>): SourceGroup[] => {
    const r = [];
    for (const group of groups) {
        let ok = false;
        for (const book of books) {
            ok = ok || group.applicable(module, book);
        }
        if (ok) {
            r.push(group);
        }
    }
    return r;
};

export const getSource = (code: string) => {
    for (const group of groups) {
        for (const source of group.sources) {
            if (source.code === code) {
                return source;
            }
        }
    }
};
