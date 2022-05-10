import React, { useEffect } from "react";
import parseReference from "../verseref/VerseRef";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { getScripture, ScriptureObject } from "../scripture/ScriptureAPI";
import { ScriptureTextView } from "../scripture/ScriptureTextView";
import { getModuleParser } from "../scripture/ParserCache";
import {
    annoKey,
    ScriptureWordAnnotation,
    ScriptureWordAnnotationFunctions,
    WordPosition,
} from "./ScriptureAnnotation";

export interface ScriptureViewerData {
    shortcode: string;
    verseref: string;
    hidemarkup: boolean;
    annotation: ScriptureWordAnnotationFunctions;
}

export const ScriptureViewer: React.FC<ScriptureViewerData> = ({ verseref, hidemarkup, shortcode, annotation }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const [scripture, setScripture] = React.useState<JSX.Element[]>([]);

    // if we directly use annotation within the useEffect, we'll get
    // continual re-renders as it's a dynamically constructed object.
    const anno_data = annotation.get();
    useEffect(() => {
        let isSubscribed = true;
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        const annoMap = new Map<string, ScriptureWordAnnotation>();
        for (const [pos, anno] of anno_data) {
            annoMap.set(annoKey(pos), anno);
        }

        const getAnno = (p: WordPosition) => {
            return annoMap.get(annoKey(p));
        };

        const module = scriptureState.catalog[shortcode];
        const parser = getModuleParser(module, shortcode);
        const res = parseReference(module, parser, verseref);

        if (res.success) {
            const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: shortcode }));
            Promise.all(scripturePromises).then((scriptures) => {
                if (!isSubscribed) {
                    return;
                }
                const elems: JSX.Element[] = [];
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
                    const last_book = i > 0 ? res.sbcs[i - 1].book : null;

                    elems.push(
                        <ScriptureTextView
                            getAnno={getAnno}
                            shortcode={shortcode}
                            last_book={last_book}
                            book={res.sbcs[i].book}
                            key={i}
                            module={module}
                            last_scripture_object={last_scripture_object}
                            scriptures={scriptures[i]}
                            markup={!hidemarkup}
                        />
                    );
                }
                setScripture(elems);
            });
        } else {
            setScripture([]);
        }

        return () => {
            isSubscribed = false;
        };
    }, [scriptureState.catalog, scriptureState.valid, shortcode, verseref, hidemarkup, anno_data]);

    if (!scriptureState.valid || !scriptureState.catalog) {
        return <div>Loading...</div>;
    }

    return <>{scripture}</>;
};
