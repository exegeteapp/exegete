import { BookInfo, ModuleInfo } from "../scripture/ScriptureCatalog";

export interface SourceDefinition {
    description: string;
    code: string; // this must unique among all sources, despite the groupings
    colour: string;
}

export interface SourceGroup {
    applicable: (module: ModuleInfo, book: BookInfo) => boolean;
    name: string;
    sources: SourceDefinition[];
}

const groups: SourceGroup[] = [
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
