// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor, Editor, Transforms } from "slate";
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import React from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import useConstant from "use-constant";
import { getScripture } from "../scripture/ScriptureAPI";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { getModuleParser } from "../scripture/ParserCache";
import parseReference, { ParseResultSuccess } from "../verseref/VerseRef";
import {
    annoKey,
    ScriptureWordAnnotation,
    ScriptureWordAnnotationFunctions,
    WordPosition,
} from "./ScriptureAnnotation";
import ReactDOM from "react-dom";
import { Button, ButtonGroup, ButtonToolbar } from "reactstrap";
import { faCheck, faStrikethrough, faWindowClose, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getSource } from "../sources/Sources";
import { languageClass } from "../scripture/ScriptureCatalog";

type ParaElement = {
    type: "paragraph";
    children: (CustomElement | CustomText)[];
};

type WordElement = {
    type: "word";
    value: string;
    children: CustomText[];
    position: WordPosition;
    source: string;
    hidden: boolean;
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

const EditorElement: React.FC<RenderElementProps> = (props) => {
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
    const sourceDefn = getSource("NT", element.source);
    return (
        <span
            {...attributes}
            contentEditable={false}
            style={{
                textDecoration: element.hidden ? "line-through" : "none",
                color: sourceDefn ? sourceDefn.colour : "black",
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

const calculateInitialValue = async (
    shortcode: string,
    res: ParseResultSuccess,
    annotation: ScriptureWordAnnotationFunctions
): Promise<Descendant[]> => {
    const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: shortcode }));
    const scriptures = await Promise.all(scripturePromises);
    const anno = annotation.get();
    const annoMap = new Map<string, ScriptureWordAnnotation>();
    const make_para = (elems_1: Descendant[]): ParaElement => {
        // the mandatory space at the start of every paragraph is there so the user can
        // get their cursor in before the first immutable/null word
        return {
            type: "paragraph",
            children: [{ type: "text", text: " " }, ...elems_1],
        };
    };
    for (const [p_2, a] of anno) {
        annoMap.set(annoKey(p_2), a);
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
            if (obj.type !== "verse") {
                continue; // we don't want to annotate footnotes or titles...
            }
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
                wordElem.push({
                    type: "word",
                    value: word.value,
                    children: [{ type: "text", text: "" }],
                    source: wordAnno ? wordAnno.source : "",
                    hidden: wordAnno ? wordAnno.hidden : false,
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
};

export const Portal: React.FC = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
};

const setOnSelection = (editor: Editor, props: any) => {
    Transforms.setNodes(editor, props, {
        match: (node, path) => {
            // FIXME: I can't work out how to do this properly with slate's typescript stuff
            // (where is Element.isElement that the docs point to?).. so we hack around it.
            const word = node as WordElement;
            if (word.type !== "word") {
                return false;
            }
            return true;
        },
        split: false,
        mode: "lowest",
    });
};

const HideButton: React.FC<{ value: boolean; icon: IconDefinition }> = ({ value, icon }) => {
    const editor = useSlate();
    return (
        <Button className="float-end" onClick={() => setOnSelection(editor, { hidden: value })}>
            <FontAwesomeIcon icon={icon} />
        </Button>
    );
};

const SourceButton: React.FC<{ source: string; icon?: IconDefinition }> = ({ source, icon }) => {
    const editor = useSlate();
    return (
        <Button className="float-end" onClick={() => setOnSelection(editor, { source: source })}>
            {icon ? <FontAwesomeIcon icon={icon} /> : source}
        </Button>
    );
};

const EditorMenu = React.forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <div
            className="editor-popupmenu"
            ref={ref}
            onMouseDown={(e) => {
                // stop focus grab
                e.preventDefault();
            }}
        >
            <ButtonToolbar className="float-end mb-1">
                <ButtonGroup>
                    <SourceButton source="" icon={faWindowClose} />
                    <SourceButton source="Mk" />
                    <SourceButton source="M" />
                    <SourceButton source="L" />
                    <SourceButton source="Q" />
                </ButtonGroup>
                <ButtonGroup>
                    <HideButton value={true} icon={faStrikethrough} />
                    <HideButton value={false} icon={faCheck} />
                </ButtonGroup>
            </ButtonToolbar>
        </div>
    );
});

const HoveringToolbar = () => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const editor = useSlate();
    const inFocus = useFocused();

    React.useEffect(() => {
        const el = ref.current;
        const { selection } = editor;

        if (!el) {
            return;
        }

        // we have a word to annotate if there is a void, or there is a string selected
        if (!selection || !inFocus || (!Editor.void(editor) && Editor.string(editor, selection) === "")) {
            el.removeAttribute("style");
            return;
        }

        const domSelection = window.getSelection();
        if (domSelection) {
            const domRange = domSelection.getRangeAt(0);
            const rect = domRange.getBoundingClientRect();
            let top = rect.top + window.pageYOffset - el.offsetHeight;
            let left = rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2;
            if (left < 5) {
                left = 5;
            }
            el.style.opacity = "1";
            el.style.top = `${top}px`;
            el.style.left = `${left}px`;
        }
    });

    return (
        <Portal>
            <EditorMenu ref={ref} />
        </Portal>
    );
};

const calculateAnnotations = (value: Descendant[]): [WordPosition, ScriptureWordAnnotation][] => {
    // build a fast lookup table for annotations by position
    // we don't need to keep existing annotations, we're rebuilding them
    // all from the state of slate
    const annoMap = new Map<string, ScriptureWordAnnotation>();
    const annotated = new Set<WordPosition>();

    const newAnno = (): ScriptureWordAnnotation => {
        return {
            postText: "",
            preText: "",
            source: "",
            paraSkip: 0,
            hidden: false,
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
                let key = annoKey(currentPos);
                let anno = annoMap.get(key);

                if (para_pending > 0 || child.source !== "" || child.hidden) {
                    if (!anno) {
                        anno = newAnno();
                    }
                    anno.paraSkip = para_pending;
                    anno.hidden = child.hidden;
                    anno.source = child.source;
                    para_pending = 0;
                }

                if (anno) {
                    annoMap.set(key, anno);
                    annotated.add(currentPos);
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
                let anno = annoMap.get(key);

                if (text) {
                    if (!anno) {
                        anno = newAnno();
                    }
                    if (forward) {
                        anno.preText = text;
                    } else {
                        anno.postText = text;
                    }
                    if (anno) {
                        annoMap.set(key, anno);
                        annotated.add(pos);
                    }
                }
            }
        }

        para_pending += 1;
    }

    return Array.from(annotated).map((pos) => {
        const key = annoKey(pos);
        return [pos, annoMap.get(key)!];
    });
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

    const renderElement = React.useCallback((props: RenderElementProps) => <EditorElement {...props} />, []);

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
            if (event.key !== " " && event.key !== "Enter" && event.key !== "Backspace") {
                event.preventDefault();
                return;
            }
        };

        if (res.success) {
            calculateInitialValue(shortcode, res, annotation).then((initialValue) => {
                if (isSubscribed) {
                    setEditorElem(
                        <Slate editor={editor} value={initialValue} onChange={onChange}>
                            <HoveringToolbar />
                            <Editable
                                className={languageClass(module.language)}
                                renderElement={renderElement}
                                onKeyDown={onKeyDown}
                            />
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
