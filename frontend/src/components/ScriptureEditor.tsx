// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor, Editor } from "slate";
import { ReactEditor, RenderElementProps, useFocused, useSelected } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import React from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import useConstant from "use-constant";
import { getScripture } from "../scripture/ScriptureAPI";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { getModuleParser } from "../scripture/ParserCache";
import parseReference, { ParseResultSuccess } from "../verseref/VerseRef";
import { ScriptureWordAnnotation, ScriptureWordAnnotationFunctions, WordPosition } from "./ScriptureAnnotation";

type ParaElement = {
    type: "paragraph";
    children: (CustomElement | CustomText)[];
};

type WordElement = {
    type: "word";
    value: string;
    children: CustomText[];
    position: WordPosition;
};

type CustomText = {
    type: "text";
    text: string;
};

type CustomElement = ParaElement | WordElement;

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

const withWords = (editor: Editor) => {
    const { isInline, isVoid } = editor;

    editor.isInline = (element: CustomElement) => {
        return element.type === "word" ? true : isInline(element);
    };

    editor.isVoid = (element: CustomElement) => {
        return element.type === "word" ? true : isVoid(element);
    };

    return editor;
};

const Element = (props: RenderElementProps) => {
    const { attributes, children, element } = props;
    switch (element.type) {
        case "word":
            return <Word {...props} />;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Word: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
    const selected = useSelected();
    const focused = useFocused();
    if (element.type !== "word") {
        return <></>;
    }
    return (
        <span
            {...attributes}
            contentEditable={false}
            style={{
                padding: "3px 3px 2px",
                margin: "0 1px",
                verticalAlign: "baseline",
                display: "inline-block",
                borderRadius: "4px",
                backgroundColor: "#eee",
                boxShadow: selected && focused ? "0 0 0 2px #B4D5FF" : "none",
            }}
        >
            {element.value}
            {children}
        </span>
    );
};

const calculateInitialValue = (
    shortcode: string,
    res: ParseResultSuccess,
    annotation: ScriptureWordAnnotationFunctions
): Promise<Descendant[]> => {
    const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: shortcode }));
    return Promise.all(scripturePromises).then((scriptures) => {
        const anno = annotation.get();
        const annoMap = new Map<string, ScriptureWordAnnotation>();

        const make_para = (elems: Descendant[]): ParaElement => {
            // the mandatory space at the start of every paragraph is there so the user can
            // get their cursor in before the first immutable/null word
            return {
                type: "paragraph",
                children: [{ type: "text", text: " " }, ...elems],
            };
        };

        const annoKey = (p: WordPosition) => {
            return JSON.stringify([p.book, p.chapter, p.verse, p.index]);
        };

        for (const [p, a] of anno) {
            annoMap.set(annoKey(p), a);
        }
        const initialValue: ParaElement[] = [];

        let wordElem: Descendant[] = [];
        for (let i = 0; i < scriptures.length; i++) {
            const book = res.sbcs[i].book;
            const objs = scriptures[i];
            if (!objs) {
                continue;
            }
            for (const obj of objs) {
                for (let wi = 0; wi < obj.text.length; wi++) {
                    const word = obj.text[wi];
                    const position = {
                        book: book,
                        chapter: obj.chapter_start,
                        verse: obj.verse_start,
                        index: wi,
                    };
                    const wordAnno = annoMap.get(annoKey(position));
                    if (wordAnno && wordAnno.paraSkip > 0) {
                        initialValue.push(make_para(wordElem));
                        for (let i = 0; i < wordAnno.paraSkip - 1; i++) {
                            initialValue.push(make_para([]));
                        }
                        wordElem = [];
                    }
                    if (wordAnno && wordAnno.preText) {
                        wordElem.push({
                            type: "text",
                            text: wordAnno.preText,
                        });
                    }
                    wordElem.push({
                        type: "word",
                        value: word.value,
                        children: [{ type: "text", text: "" }],
                        position,
                    });
                    wordElem.push({
                        type: "text",
                        text: wordAnno && wordAnno.postText ? wordAnno.postText : " ",
                    });
                }
            }
        }
        if (wordElem) {
            initialValue.push(make_para(wordElem));
        }

        return initialValue;
    });
};

const calculateAnnotations = (value: Descendant[]) => {
    // build a fast lookup table for annotations by position
    // we don't need to keep existing annotations, we're rebuilding them
    // all from the state of slate
    const annoMap = new Map<WordPosition, ScriptureWordAnnotation>();

    const newAnno = () => {
        return {
            postText: "",
            preText: "",
            source: "",
            paraSkip: 0,
        };
    };

    // iterate through top level paragraphs
    let para_pending = 0;
    for (const child of value) {
        if (child.type !== "paragraph") {
            continue;
        }
        const para = child;

        let currentPos: WordPosition | null = null;
        for (let i = 0; i < para.children.length; i++) {
            const child = para.children[i];

            if (child.type === "word") {
                currentPos = child.position;

                if (para_pending > 0) {
                    let anno: ScriptureWordAnnotation = annoMap.has(currentPos) ? annoMap.get(currentPos)! : newAnno();
                    anno.paraSkip = para_pending;
                    para_pending = 0;
                    annoMap.set(currentPos, anno);
                }

                continue;
            }

            // this ought not to happen
            if (child.type !== "text") {
                continue;
            }

            let text = child.text;
            // special case: regular space between words doesn't really count (they're just a UI detail,
            // not user input), but we do need to go through the handling in case there was a previous value
            if (text === " ") {
                text = "";
            }

            let pos = currentPos;
            const forward = pos === null;
            if (forward) {
                // scan forward until we find a word
                for (let j = i; j < para.children.length; j++) {
                    const nextChild = para.children[j];
                    if (nextChild.type === "word") {
                        pos = nextChild.position;
                        break;
                    }
                }
            }

            // this won't happen unless there just aren't any words
            if (pos === null) {
                continue;
            }

            if (text) {
                let anno: ScriptureWordAnnotation = annoMap.has(pos) ? annoMap.get(pos)! : newAnno();
                if (forward) {
                    anno.preText = text;
                } else {
                    anno.postText = text;
                }
                annoMap.set(pos, anno);
            }
        }

        para_pending += 1;
    }

    // the filter is so we don't bother writing out trivial non-annotations
    return Array.from(annoMap).filter(([_, anno]) => anno.preText || anno.postText || anno.source || anno.paraSkip > 0);
};

export const ScriptureEditor: React.FC<{
    shortcode: string;
    verseref: string;
    annotation: ScriptureWordAnnotationFunctions;
}> = ({ shortcode, verseref, annotation }) => {
    const editor = useConstant(() => withReact(withWords(withHistory(createEditor()))));
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const [editorElem, setEditorElem] = React.useState<JSX.Element>(<></>);
    const [haveInitialValue, setHaveInitialValue] = React.useState(false);

    const renderElement = React.useCallback((props: RenderElementProps) => <Element {...props} />, []);

    React.useEffect(() => {
        let isSubscribed = true;
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        // awful hack: slate keeps complex internal state, so for now we never rebuild the initial value
        // without a total unmount / remount of this component.
        if (haveInitialValue) {
            return;
        }

        // we use the shortcode and verseref coming in via the cell data
        // if the user wishes to change them, that percolates back up and
        // down into us via cell data
        const module = scriptureState.catalog[shortcode];
        const parser = getModuleParser(module, shortcode);
        const res = parseReference(module, parser, verseref);

        const onChange = (value: Descendant[]) => {
            annotation.set(calculateAnnotations(value));
        };

        const setError = () => {
            setEditorElem(<div>An error occurred.</div>);
        };

        const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
            // let's not tampr with special keys
            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }
            // Tab is 4 spaces
            if (event.key === "Tab") {
                event.preventDefault();
                Editor.insertText(editor, "    ");
                return;
            }
            // we let the user input whitespace characters for padding, but nothing else.
            if (event.key !== " " && event.key !== "Enter") {
                event.preventDefault();
                return;
            }
        };

        if (res.success) {
            calculateInitialValue(shortcode, res, annotation).then((initialValue) => {
                if (isSubscribed) {
                    setEditorElem(
                        <Slate editor={editor} value={initialValue} onChange={onChange}>
                            <Editable renderElement={renderElement} onKeyDown={onKeyDown} />
                        </Slate>
                    );
                    setHaveInitialValue(true);
                }
            });
        } else {
            setError();
        }

        return () => {
            isSubscribed = false;
        };
    }, [
        editor,
        scriptureState.catalog,
        scriptureState.valid,
        shortcode,
        verseref,
        renderElement,
        annotation,
        haveInitialValue,
    ]);

    return editorElem;
};
