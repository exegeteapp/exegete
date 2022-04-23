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
import parseReference from "../verseref/VerseRef";

interface WordPosition {
    book: string;
    chapter: number;
    verse: number;
    index: number;
}

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

export const ScriptureEditor: React.FC<{ shortcode: string; verseref: string }> = ({ shortcode, verseref }) => {
    const editor = useConstant(() => withReact(withWords(withHistory(createEditor()))));
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const [editorElem, setEditorElem] = React.useState<JSX.Element>(<></>);
    // const [value, setValue] = React.useState<Descendant[]>([]);

    const renderElement = React.useCallback((props: RenderElementProps) => <Element {...props} />, []);

    React.useEffect(() => {
        let isSubscribed = true;
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        // we use the shortcode and verseref coming in via the cell data
        // if the user wishes to change them, that percolates back up and
        // down into us via cell data
        const module = scriptureState.catalog[shortcode];
        const parser = getModuleParser(module, shortcode);
        const res = parseReference(module, parser, verseref);

        const setError = () => {
            setEditorElem(<div>An error occurred.</div>);
        };

        const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
            switch (event.key) {
                case "Tab":
                    event.preventDefault();
                    Editor.insertText(editor, "    ");
                    break;
            }
        };

        if (res.success) {
            const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: shortcode }));
            Promise.all(scripturePromises).then((scriptures) => {
                if (!isSubscribed) {
                    return;
                }

                const wordElem: Descendant[] = [];
                for (let i = 0; i < scriptures.length; i++) {
                    const book = res.sbcs[i].book;
                    const objs = scriptures[i];
                    if (!objs) {
                        continue;
                    }
                    for (const obj of objs) {
                        for (let wi = 0; wi < obj.text.length; wi++) {
                            const word = obj.text[wi];
                            wordElem.push({
                                type: "word",
                                value: word.value,
                                children: [{ text: "" }],
                                position: {
                                    book: book,
                                    chapter: obj.chapter_start,
                                    verse: obj.verse_start,
                                    index: wi,
                                },
                            });
                            wordElem.push({
                                text: " ",
                            });
                        }
                    }
                }

                const initialValue: ParaElement[] = [
                    {
                        type: "paragraph",
                        children: wordElem,
                    },
                ];

                setEditorElem(
                    <Slate editor={editor} value={initialValue} onChange={onChange}>
                        <Editable renderElement={renderElement} onKeyDown={onKeyDown} />
                    </Slate>
                );
            });
        } else {
            setError();
        }

        return () => {
            isSubscribed = false;
        };
    }, [editor, scriptureState.catalog, scriptureState.valid, shortcode, verseref, renderElement]);

    const onChange = (newValue: Descendant[]) => {
        // setValue(newValue);
    };

    return editorElem;
};
