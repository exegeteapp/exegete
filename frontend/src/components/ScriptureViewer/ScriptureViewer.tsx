import React, { useEffect } from "react";
import parseReference from "verseref/dist/VerseRef";
import { getScripture, ScriptureObject } from "../../scripture/ScriptureAPI";
import { ScriptureTextView } from "./ScriptureTextView";
import { getModuleParser } from "../../scripture/ParserCache";
import {
    annoKey,
    ScriptureWordAnnotation,
    ScriptureWordAnnotationFunctions,
    WordPosition,
} from "../../scripture/ScriptureAnnotation";
import { useGetScriptureCatalogQuery } from "../../api/api";

export interface ScriptureViewerData {
    readonly shortcode: string;
    readonly verseref: string;
    readonly hidemarkup: boolean;
    readonly separateverses: boolean;
    readonly annotation: ScriptureWordAnnotationFunctions;
}

export const ScriptureViewer: React.FC<React.PropsWithChildren<ScriptureViewerData>> = ({
    verseref,
    hidemarkup,
    shortcode,
    annotation,
    separateverses,
}) => {
    const { data: catalog } = useGetScriptureCatalogQuery();
    const [scriptures, setScriptures] = React.useState<(ReadonlyArray<ScriptureObject> | null)[]>([]);
    const [books, setBooks] = React.useState<string[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        if (!catalog) {
            return;
        }

        const module = catalog[shortcode];
        const parser = getModuleParser(module, shortcode);
        const res = parseReference(module.books, parser, verseref);

        if (res.success) {
            setBooks(res.sbcs.map((sbc) => sbc.book));
            const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: shortcode }));
            Promise.all(scripturePromises).then((scriptures) => {
                if (!isSubscribed) {
                    return;
                }
                setScriptures(scriptures);
            });
        } else {
            setBooks([]);
            setScriptures([]);
        }

        return () => {
            isSubscribed = false;
        };
    }, [catalog, shortcode, verseref]);

    // if we directly use annotation within the useEffect, we'll get
    // continual re-renders as it's a dynamically constructed object.
    const anno_data = annotation.get();
    const annoMap = new Map<string, ScriptureWordAnnotation>();
    for (const [pos, anno] of anno_data) {
        annoMap.set(annoKey(pos), anno);
    }

    const getAnno = (p: WordPosition) => {
        return annoMap.get(annoKey(p));
    };

    const elems: JSX.Element[] = [];
    if (catalog) {
        const module = catalog[shortcode];
        for (let i = 0; i < scriptures.length; i++) {
            // backtrack looking for the previous scripture object displayed
            let last_scripture_object: ScriptureObject | null = null;
            for (let j = i - 1; j >= 0; j--) {
                const s = scriptures[j];
                if (s && s.length > 0) {
                    last_scripture_object = s[s.length - 1];
                    break;
                }
            }
            const last_book = i > 0 ? books[i - 1] : null;

            elems.push(
                <ScriptureTextView
                    getAnno={getAnno}
                    shortcode={shortcode}
                    last_book={last_book}
                    book={books[i]}
                    key={i}
                    module={module}
                    last_scripture_object={last_scripture_object}
                    scriptures={scriptures[i]}
                    markup={!hidemarkup}
                    separateverses={separateverses}
                />,
            );
        }
    }

    if (!catalog) {
        return <div>Loading...</div>;
    }

    return <>{elems}</>;
};
