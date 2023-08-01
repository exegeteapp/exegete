// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import React from "react";
import { createEditor, Descendant, Editor } from "slate";
import { withHistory } from "slate-history";
import { Editable, RenderElementProps, Slate, withReact } from "slate-react";
import { useGetScriptureCatalogQuery } from "../../api/api";
import { useAppDispatch } from "../../exegete/hooks";
import { getModuleParser } from "../../scripture/ParserCache";
import {
    annoKey,
    newScriptureWordAnnotation,
    ScriptureWordAnnotation,
    ScriptureWordAnnotationFunctions,
    WordPosition,
} from "../../scripture/ScriptureAnnotation";
import { getScripture } from "../../scripture/ScriptureAPI";
import { languageClass, ModuleInfo } from "../../scripture/ScriptureCatalog";
import { BookInfo, FindBook } from "verseref/dist/Types";
import { applicableGroups } from "../../sources/Sources";
import parseReference, { ParseResultSuccess, ScriptureBookChapters } from "verseref/dist/VerseRef";
import { workspaceCanApplyHistory, workspaceCannotApplyHistory } from "../../workspace/Workspace";
import { AnnotationArray } from "../Cells/Scripture";
import { HoveringToolbar } from "./HoveringToolbar";
import { CustomElement, ParaElement } from "./Types";
import { VerseRef } from "./VerseRef";
import { Word } from "./Word";

const PermittedKeys = new Set<string>([
    " ",
    "Enter",
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
]);

const withWords = (editor: Editor) => {
    const { isInline, isVoid } = editor;

    editor.isInline = (element: CustomElement) => {
        return element.type === "word" || element.type === "verseref" ? true : isInline(element);
    };

    editor.isVoid = (element: CustomElement) => {
        return element.type === "word" || element.type === "verseref" ? true : isVoid(element);
    };

    return editor;
};

const EditorElement: React.FC<React.PropsWithChildren<RenderElementProps>> = (props) => {
    const { attributes, children, element } = props;
    switch (element.type) {
        case "word":
            return <Word {...props} />;
        case "verseref":
            return <VerseRef {...props} />;
        default:
            return (
                <p className="editor-para" {...attributes}>
                    {children}
                </p>
            );
    }
};

const calculateInitialValue = async (
    shortcode: string,
    res: ParseResultSuccess,
    annotation: ScriptureWordAnnotationFunctions,
    repAnnotation: AnnotationArray,
    separateverses: boolean,
    hidemarkup: boolean,
): Promise<Descendant[]> => {
    const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: shortcode }));
    const scriptures = await Promise.all(scripturePromises);
    const anno = annotation.get();
    const make_para = (elems_1: Descendant[]): ParaElement => {
        // the mandatory space at the start of every paragraph is there so the user can
        // get their cursor in before the first immutable/null word
        return {
            type: "paragraph",
            children: [{ type: "text", text: " " }, ...elems_1],
        };
    };

    const annoMap = new Map<string, ScriptureWordAnnotation>();
    for (const [p_2, a] of anno) {
        annoMap.set(annoKey(p_2), a);
    }
    const repAnnoMap = new Map<string, ScriptureWordAnnotation>();
    for (const [p_2, a] of repAnnotation) {
        repAnnoMap.set(annoKey(p_2), a);
    }

    const initialValue: ParaElement[] = [];
    let wordElem: Descendant[] = [];

    const annoToStyle = (anno: ScriptureWordAnnotation | undefined) => {
        return {
            highlight: anno ? anno.highlight : "",
            source: anno ? anno.source : "",
            display: anno ? anno.display : "",
        };
    };

    for (let i = 0; i < scriptures.length; i++) {
        const book = res.sbcs[i].book;
        const objs = scriptures[i];
        if (!objs) {
            continue;
        }
        for (const obj of objs) {
            if (obj.type !== "verse") {
                continue; // we don't want to annotate footnotes or titles...
            }
            if (!hidemarkup) {
                wordElem.push({
                    type: "verseref",
                    value: `${obj.chapter_start}:${obj.verse_start}`,
                    children: [{ type: "text", text: "" }],
                });
                wordElem.push({
                    type: "text",
                    text: " ",
                });
            }
            for (let wi = 0; wi < obj.text.length; wi++) {
                const word = obj.text[wi];
                const position = {
                    shortcode: shortcode,
                    book: book,
                    chapter: obj.chapter_start,
                    verse: obj.verse_start,
                    index: wi,
                };
                const wordAnno = annoMap.get(annoKey(position));
                if (wordAnno && wordAnno.paraSkip > 0) {
                    initialValue.push(make_para(wordElem));
                    for (let i_1 = 0; i_1 < wordAnno.paraSkip - 1; i_1++) {
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
                const wordRepAnno = repAnnoMap.get(annoKey(position));
                wordElem.push({
                    ...annoToStyle(wordAnno),
                    subStyle: annoToStyle(wordRepAnno),
                    type: "word",
                    value: word.value,
                    children: [{ type: "text", text: "" }],
                    start_of_verse: wi === 0,
                    position,
                });
                wordElem.push({
                    type: "text",
                    text: wordAnno && wordAnno.postText ? wordAnno.postText : " ",
                });
            }
            if (separateverses) {
                initialValue.push(make_para(wordElem));
                wordElem = [];
            }
        }
    }
    if (wordElem) {
        initialValue.push(make_para(wordElem));
    }
    return initialValue;
};

const calculateAnnotations = (
    value: Descendant[],
    separateverses: boolean,
): [WordPosition, ScriptureWordAnnotation][] => {
    // build a fast lookup table for annotations by position
    // we don't need to keep existing annotations, we're rebuilding them
    const annoMap = new Map<string, [WordPosition, ScriptureWordAnnotation]>();

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
                let key = annoKey(currentPos);
                const entry = annoMap.get(key);
                let anno = entry ? entry[1] : undefined;

                // bit of a hack: if we're in the separate verses mode, chop one off para_pending when we hit a
                // new verse
                if (child.start_of_verse && para_pending > 0 && separateverses) {
                    para_pending -= 1;
                }

                if (para_pending > 0 || child.source !== "" || child.display || child.highlight) {
                    if (!anno) {
                        anno = newScriptureWordAnnotation();
                    }
                    anno = {
                        ...anno,
                        paraSkip: para_pending,
                        display: child.display || "",
                        source: child.source || "",
                        highlight: child.highlight || "",
                    };
                    para_pending = 0;
                }

                if (anno) {
                    annoMap.set(key, [currentPos, anno]);
                }

                continue;
            } else if (child.type === "text") {
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

                const key = annoKey(pos);
                const entry = annoMap.get(key);
                let anno = entry ? entry[1] : undefined;

                if (text) {
                    if (!anno) {
                        anno = newScriptureWordAnnotation();
                    }
                    if (forward) {
                        anno = { ...anno, preText: text };
                    } else {
                        anno = { ...anno, postText: text };
                    }
                    if (anno) {
                        annoMap.set(key, [pos, anno]);
                    }
                }
            }
        }

        para_pending += 1;
    }

    return Array.from(annoMap).map(([key, [position, annotation]]) => {
        return [position, annotation];
    });
};

export const ScriptureEditor: React.FC<
    React.PropsWithChildren<{
        shortcode: string;
        verseref: string;
        annotation: ScriptureWordAnnotationFunctions;
        repAnnotation: AnnotationArray;
        separateverses: boolean;
        hidemarkup: boolean;
    }>
> = ({ shortcode, verseref, annotation, repAnnotation, separateverses, hidemarkup }) => {
    const [editor] = React.useState(() => withReact(withWords(withHistory(createEditor()))));
    const { data: catalog } = useGetScriptureCatalogQuery();
    const dispatch = useAppDispatch();

    const [editorElem, setEditorElem] = React.useState<JSX.Element>(<></>);
    const renderElement = React.useCallback((props: RenderElementProps) => <EditorElement {...props} />, []);

    React.useEffect(() => {
        // we don't want our global undo/redo function to be active while in the slate editor
        // this is an annoying issue caused by slatejs being an uncontrolled react component
        dispatch(workspaceCannotApplyHistory());
        return () => {
            dispatch(workspaceCanApplyHistory());
        };
    }, [dispatch]);

    React.useEffect(() => {
        let isSubscribed = true;
        if (!catalog) {
            return;
        }

        // we use the shortcode and verseref coming in via the cell data
        // if the user wishes to change them, that percolates back up and
        // down into us via cell data
        const module = catalog[shortcode];
        const parser = getModuleParser(module, shortcode);
        const res = parseReference(module.books, parser, verseref);

        const onChange = (value: Descendant[]) => {
            annotation.set(calculateAnnotations(value, separateverses));
        };

        const setError = () => {
            setEditorElem(<div>An error occurred.</div>);
        };

        const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
            // let's not tamper with special keys
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
            if (!PermittedKeys.has(event.key)) {
                event.preventDefault();
                return;
            }
        };

        const determineEligibleGroups = (module: ModuleInfo, sbcs: ScriptureBookChapters) => {
            const books = new Set<BookInfo>();
            for (const sbc of sbcs) {
                const book = FindBook(module.books, sbc.book);
                if (book) {
                    books.add(book);
                }
            }
            return applicableGroups(module, books);
        };

        if (res.success) {
            const eligibleGroups = determineEligibleGroups(module, res.sbcs);
            calculateInitialValue(shortcode, res, annotation, repAnnotation, separateverses, hidemarkup).then(
                (initialValue) => {
                    if (isSubscribed) {
                        setEditorElem(
                            <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
                                <HoveringToolbar groups={eligibleGroups} />
                                <Editable
                                    className={languageClass(module.language)}
                                    renderElement={renderElement}
                                    onKeyDown={onKeyDown}
                                />
                            </Slate>,
                        );
                    }
                },
            );
        } else {
            setError();
        }

        return () => {
            isSubscribed = false;
        };
    }, [editor, catalog, shortcode, verseref, renderElement, annotation, repAnnotation, separateverses, hidemarkup]);

    return editorElem;
};
