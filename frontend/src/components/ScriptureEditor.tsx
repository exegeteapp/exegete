// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor, Editor, Transforms } from "slate";
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import React from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { getScripture } from "../scripture/ScriptureAPI";
import { getModuleParser } from "../scripture/ParserCache";
import parseReference, { ParseResultSuccess, ScriptureBookChapters } from "../verseref/VerseRef";
import {
    annoKey,
    newScriptureWordAnnotation,
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
import { DistinguishableColours } from "../colours/distinguishable";
import { useGetScriptureCatalogQuery } from "../api/api";
import { useAppDispatch } from "../exegete/hooks";
import { workspaceCanApplyHistory, workspaceCannotApplyHistory } from "../workspace/Workspace";

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

type VerseRefElement = {
    type: "verseref";
    value: string;
    children: CustomText[];
};

type WordElement = {
    type: "word";
    value: string;
    start_of_verse: boolean;
    children: CustomText[];
    position: WordPosition;
} & WordAnnotation;

type CustomText = {
    type: "text";
    text: string;
};

type CustomElement = ParaElement | WordElement | VerseRefElement;

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

const NonEditableStyle = (selected: boolean, focused: boolean): React.CSSProperties => {
    return {
        verticalAlign: "baseline",
        display: "inline-block",
        backgroundColor: "#eee",
        boxShadow: selected && focused ? "0 0 0 2px #B4D5FF" : "none",
    };
};

const VerseRef: React.FC<React.PropsWithChildren<RenderElementProps>> = ({ attributes, children, element }) => {
    const selected = useSelected();
    const focused = useFocused();
    if (element.type !== "verseref") {
        return <></>;
    }
    const style = {
        ...NonEditableStyle(selected, focused),
        fontWeight: "bold",
    };
    return (
        <span {...attributes} contentEditable={false} style={style}>
            {element.value}
            {children}
        </span>
    );
};

const Word: React.FC<React.PropsWithChildren<RenderElementProps>> = ({ attributes, children, element }) => {
    const selected = useSelected();
    const focused = useFocused();
    if (element.type !== "word") {
        return <></>;
    }
    const sourceDefn = getSource(element.source);

    let td = "none";
    if (element.display === "strikethrough" && element.highlight) {
        td = "underline line-through";
    } else if (element.display === "strikethrough") {
        td = "line-through";
    } else if (element.highlight) {
        td = "underline";
    }

    const style: React.CSSProperties = {
        ...NonEditableStyle(selected, focused),
        textDecoration: td,
        opacity: element.display === "hidden" ? "25%" : "100%",
        color: sourceDefn ? sourceDefn.colour : "black",
        textDecorationColor: element.highlight ? element.highlight : "",
        textDecorationThickness: element.highlight ? "5px" : "",
        textDecorationSkipInk: "none",
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
    annotation: ScriptureWordAnnotationFunctions,
    separateverses: boolean,
    hidemarkup: boolean
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
                wordElem.push({
                    type: "word",
                    value: word.value,
                    children: [{ type: "text", text: "" }],
                    highlight: wordAnno ? wordAnno.highlight : "",
                    source: wordAnno ? wordAnno.source : "",
                    start_of_verse: wi === 0,
                    display: wordAnno ? wordAnno.display : "",
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

export const Portal: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
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
        hanging: true,
    });
};

const ToggleAnnoButton: React.FC<React.PropsWithChildren<{ attr: string; value: string; icon?: IconDefinition }>> = ({
    attr,
    value,
    icon,
}) => {
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

    const colours = DistinguishableColours.map((c, i) => {
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

const HoveringToolbar: React.FC<React.PropsWithChildren<{ groups: SourceGroup[] }>> = ({ groups }) => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const editor = useSlate();
    const inFocus = useFocused();

    React.useEffect(() => {
        const el = ref.current;
        const { selection } = editor;

        if (!el) {
            return;
        }

        const showMenu = () => {
            if (!selection || !inFocus) {
                return false;
            }
            // we have a word to annotate if there's at least one word in the selection
            const [match] = Editor.nodes(editor, {
                match: (node, path) => {
                    const word = node as WordElement;
                    if (word.type !== "word") {
                        return false;
                    }
                    return true;
                },
            });
            return !!match;
        };

        // we have a word to annotate if there is a void, or there is a string selected
        if (!showMenu()) {
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

const calculateAnnotations = (
    value: Descendant[],
    separateverses: boolean
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

                // bit of a hack: if we're in the separate verses mode, chop one of para_pending when we hit a
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
                        display: child.display,
                        source: child.source,
                        highlight: child.highlight,
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
        separateverses: boolean;
        hidemarkup: boolean;
    }>
> = ({ shortcode, verseref, annotation, separateverses, hidemarkup }) => {
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
        const res = parseReference(module, parser, verseref);

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
                const book = FindBook(module, sbc.book);
                if (book) {
                    books.add(book);
                }
            }
            return applicableGroups(module, books);
        };

        if (res.success) {
            const eligibleGroups = determineEligibleGroups(module, res.sbcs);
            calculateInitialValue(shortcode, res, annotation, separateverses, hidemarkup).then((initialValue) => {
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
                }
            });
        } else {
            setError();
        }

        return () => {
            isSubscribed = false;
        };
    }, [editor, catalog, shortcode, verseref, renderElement, annotation, separateverses, hidemarkup]);

    return editorElem;
};
