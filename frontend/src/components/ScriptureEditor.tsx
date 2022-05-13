// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor, Editor, Transforms } from "slate";
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import React from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import useConstant from "use-constant";
import { getScripture, ScriptureBookChapter } from "../scripture/ScriptureAPI";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { getModuleParser } from "../scripture/ParserCache";
import parseReference, { ParseResultSuccess } from "../verseref/VerseRef";
import {
    annoKey,
    AnnotationColours,
    ScriptureWordAnnotation,
    ScriptureWordAnnotationFunctions,
    WordPosition,
} from "./ScriptureAnnotation";
import ReactDOM from "react-dom";
import { Button, ButtonGroup, ButtonToolbar, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { faBrush, faStrikethrough, faTrashCan, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { applicableGroups, getSource, SourceGroup } from "../sources/Sources";
import { BookInfo, FindBook, languageClass, ModuleInfo } from "../scripture/ScriptureCatalog";

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

type ParaElement = {
    type: "paragraph";
    children: (CustomElement | CustomText)[];
};

type WordAnnotation = {
    source: string;
    display: string;
    highlight: string;
};

type WordElement = {
    type: "word";
    value: string;
    children: CustomText[];
    position: WordPosition;
} & WordAnnotation;

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
            return (
                <p className="editor-para" {...attributes}>
                    {children}
                </p>
            );
    }
};

const Word: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
    const selected = useSelected();
    const focused = useFocused();
    if (element.type !== "word") {
        return <></>;
    }
    const sourceDefn = getSource(element.source);

    let td = "none";
    if (element.display === "strikethrough" && element.highlight) {
        td = "underline strikethrough";
    } else if (element.display === "strikethrough") {
        td = "strikethrough";
    } else if (element.highlight) {
        td = "underline";
    }

    const style: React.CSSProperties = {
        textDecoration: td,
        opacity: element.display === "hidden" ? "25%" : "100%",
        color: sourceDefn ? sourceDefn.colour : "black",
        verticalAlign: "baseline",
        display: "inline-block",
        backgroundColor: "#eee",
        boxShadow: selected && focused ? "0 0 0 2px #B4D5FF" : "none",
        textDecorationColor: element.highlight ? element.highlight : "",
        textDecorationThickness: element.highlight ? "5px" : "",
    };
    return (
        <span {...attributes} contentEditable={false} style={style}>
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
                wordElem.push({
                    type: "word",
                    value: word.value,
                    children: [{ type: "text", text: "" }],
                    highlight: wordAnno ? wordAnno.highlight : "",
                    source: wordAnno ? wordAnno.source : "",
                    display: wordAnno ? wordAnno.display : "",
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

const activeOnSelection = (editor: Editor, key: string, value: string): boolean => {
    const [match] = Editor.nodes(editor, {
        match: (node, path) => {
            const word = node as WordElement;
            if (word.type !== "word") {
                return false;
            }
            return (word as any)[key] === value;
        },
    });
    return !!match;
};

const toggleOnSelection = (editor: Editor, key: string, value: string) => {
    const isSet = activeOnSelection(editor, key, value);
    const props = isSet ? { [key]: "" } : { [key]: value };
    Transforms.setNodes(editor, props, {
        match: (node, path) => {
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

const ToggleAnnoButton: React.FC<{ attr: string; value: string; icon?: IconDefinition }> = ({ attr, value, icon }) => {
    const editor = useSlate();
    return (
        <Button
            active={activeOnSelection(editor, attr, value)}
            className="float-end"
            onClick={() => toggleOnSelection(editor, attr, value)}
        >
            {icon ? <FontAwesomeIcon icon={icon} /> : value}
        </Button>
    );
};

const EditorMenu = React.forwardRef<HTMLDivElement, { groups: SourceGroup[] }>(({ groups }, ref) => {
    const editor = useSlate();

    // FIXME grahame tomorrow build the anno buttons dynamically...
    const bgs: React.ReactElement[] = groups.map((group, index) => {
        const btns = group.sources.map((source, index) => {
            return <ToggleAnnoButton attr="source" value={source.code} key={index} />;
        });
        return (
            <ButtonGroup className="pe-1" key={index}>
                {btns}
            </ButtonGroup>
        );
    });

    const colours = AnnotationColours.map((c, i) => {
        return (
            <Button
                active={activeOnSelection(editor, "highlight", c)}
                key={i}
                onClick={() => toggleOnSelection(editor, "highlight", c)}
                style={{ backgroundColor: c }}
            />
        );
    });

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
                {bgs}
                <ButtonGroup>
                    <UncontrolledDropdown nav className="toolbar-dropdown">
                        <DropdownToggle caret nav>
                            <FontAwesomeIcon icon={faBrush} />
                        </DropdownToggle>
                        <DropdownMenu color="dark" dark>
                            {colours}
                        </DropdownMenu>
                    </UncontrolledDropdown>

                    <ToggleAnnoButton attr="display" value="strikethrough" icon={faStrikethrough} />
                    <ToggleAnnoButton attr="display" value="hidden" icon={faTrashCan} />
                </ButtonGroup>
            </ButtonToolbar>
        </div>
    );
});

const HoveringToolbar: React.FC<{ groups: SourceGroup[] }> = ({ groups }) => {
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
            <EditorMenu ref={ref} groups={groups} />
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
            display: "",
            highlight: "",
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

                if (para_pending > 0 || child.source !== "" || child.display || child.highlight) {
                    if (!anno) {
                        anno = newAnno();
                    }
                    anno.paraSkip = para_pending;
                    anno.display = child.display;
                    anno.source = child.source;
                    anno.highlight = child.highlight;
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
            if (!PermittedKeys.has(event.key)) {
                event.preventDefault();
                return;
            }
        };

        const determineEligibleGroups = (module: ModuleInfo, sbcs: ScriptureBookChapter[]) => {
            const books = new Set<BookInfo>();
            for (const sbc of sbcs) {
                const book = FindBook(module, sbc.book);
                if (book) {
                    books.add(book);
                }
            }
            return applicableGroups(module, books);
        };

        if (res.success) {
            const eligibleGroups = determineEligibleGroups(module, res.sbcs);
            calculateInitialValue(shortcode, res, annotation).then((initialValue) => {
                if (isSubscribed) {
                    setEditorElem(
                        <Slate editor={editor} value={initialValue} onChange={onChange}>
                            <HoveringToolbar groups={eligibleGroups} />
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
