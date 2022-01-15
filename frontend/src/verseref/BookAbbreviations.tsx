import { ModuleInfo } from "../scripture/ScriptureCatalog";

const generateAbbreviations = (module: ModuleInfo) => {
    // books can be identified by the shortest non-ambiguous abbreviation
    const book_abbrevations = new Map<string, Set<string>>();
    const abbrevcount = new Map<string, number>();
    const number_re = /^\d+$/;
    const ends_space = /^.* $/;

    const abbrev_map = (s: string, f: (sub: string) => void) => {
        const abbrevs = new Set<string>();
        const gen = (s: string) => {
            for (let i = s.length - 1; i >= 0; i--) {
                abbrevs.add(s.substr(0, i));
            }
        }
        gen(s);
        // strip whitespace and generate new abbreviations if relevant
        const ns = s.replace(/ /g,'')
        if (s !== ns) {
            gen(ns);
        }
        abbrevs.forEach((a: string) => {
            // numeric abbreviations are excluded as they clash with verse numbers
            if (!a.match(number_re) && !a.match(ends_space)) {
                f(a);
            }
        });
    }

    for (const book of module.books) {
        const abbrevs = new Set<string>();
        book_abbrevations.set(book.name, abbrevs);
        // books can always be directly referenced by their name
        abbrevs.add(book.name);
        // ... and by their name without whitespace
        abbrevs.add(book.name.replace(/ /g, ''));
        abbrev_map(book.name, (abbrev) => {
            if (!abbrevcount.has(abbrev)) {
                abbrevcount.set(abbrev, 0);
            }
            abbrevcount.set(abbrev, (abbrevcount.get(abbrev) as number) + 1);
        });
    }

    for (const book of module.books) {
        const abbrevs = book_abbrevations.get(book.name) as Set<string>;
        abbrev_map(book.name, (abbrev) => {
            const c = abbrevcount.get(abbrev) as number;
            if (c === 1) {
                abbrevs.add(abbrev);
            }
        });
    }

    return book_abbrevations;
}

export default generateAbbreviations;