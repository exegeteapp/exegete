import React from "react";
import { ScriptureWordAnnotation, WordPosition } from "../../scripture/ScriptureAnnotation";
import { getSource } from "../../sources/Sources";
import { ScriptureObject, ScriptureWord } from "../../scripture/ScriptureAPI";
import { languageClass, ModuleInfo } from "../../scripture/ScriptureCatalog";
import { IntertextureContext } from "../IntertextureToolbar/Types";
import { useAppDispatch } from "../../exegete/hooks";
import { toolbarShow } from "../../exegete/toolbar";

interface RenderState {
    readonly book: string | null;
    readonly chapter: number | null;
    readonly verse: number | null;
}

export const ScriptureTextView: React.FC<
    React.PropsWithChildren<{
        getAnno: (p: WordPosition) => ScriptureWordAnnotation | undefined;
        module: ModuleInfo;
        book: string;
        shortcode: string;
        scriptures: ReadonlyArray<ScriptureObject> | null;
        last_scripture_object: ScriptureObject | null;
        last_book: string | null;
        markup: boolean;
        separateverses: boolean;
    }>
> = ({ module, getAnno, scriptures, last_book, book, last_scripture_object, markup, shortcode, separateverses }) => {
    const dispatch = useAppDispatch();

    if (!scriptures) {
        return <></>;
    }
    var state: RenderState = {
        book: last_book,
        chapter: last_scripture_object ? last_scripture_object.chapter_end : null,
        verse: last_scripture_object ? last_scripture_object.verse_end : null,
    };

    const WordMenuEventHandler = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        const t = event.currentTarget;
        const rect = t.getBoundingClientRect();
        const context: IntertextureContext = {
            word: t.getAttribute("data-np") || t.innerText,
            top: rect.top,
            left: rect.left,
            width: rect.width,
            language: t.getAttribute("data-lang") || module.language,
        };
        dispatch(toolbarShow(["intertexture", context]));
    };

    const renderText = (words: ReadonlyArray<ScriptureWord>, startingPosition: WordPosition) => {
        return words.map((text, i) => {
            const elems: JSX.Element[] = [];

            const position = {
                ...startingPosition,
                index: i,
            };
            const anno = getAnno(position);

            if (anno && anno.paraSkip) {
                for (let i = 0; i < anno.paraSkip; i++) {
                    elems.push(<br key={"br" + elems.length} />);
                }
            }

            let className = "scripture-word";
            // specific language for this word, if any
            const language = text.language && text.language !== module.language ? text.language : undefined;
            if (language) {
                className += " " + languageClass(text.language);
            }
            const sourceDefn = anno ? getSource(anno.source) : undefined;
            let td = "none";
            if (anno) {
                if (anno.display === "strikethrough" && anno.highlight) {
                    td = "underline line-through";
                } else if (anno.display === "strikethrough") {
                    td = "line-through";
                } else if (anno.highlight) {
                    td = "underline";
                }
            }
            const style: React.CSSProperties = {
                color: sourceDefn ? sourceDefn.colour : "black",
                visibility: anno && anno.display === "hidden" ? "hidden" : "visible",
                textDecoration: td,
                textDecorationColor: anno && anno.highlight ? anno.highlight : "",
                textDecorationThickness: anno && anno.highlight ? "5px" : "",
                textDecorationSkipInk: "none",
            };
            return (
                <span key={"span" + i}>
                    {elems}
                    {anno ? anno.preText : ""}
                    <span
                        className={className}
                        data-np={text["s-nopunct"]}
                        data-language={language}
                        style={style}
                        key={i}
                        onClick={WordMenuEventHandler}
                    >
                        {text.value}
                    </span>
                    {anno && anno.postText ? anno.postText : " "}
                </span>
            );
        });
    };

    const elems: JSX.Element[] = [];
    for (let i = 0; i < scriptures.length; ++i) {
        const d = scriptures[i];

        const startingPosition = {
            shortcode: shortcode,
            book: book,
            chapter: d.chapter_start,
            verse: d.verse_start,
            index: 0,
        };

        if (d.type === "title") {
            if (markup) {
                elems.push(<h2 key={elems.length}>{renderText(d.text, startingPosition)}</h2>);
            }
        } else if (d.type === "verse") {
            const verse_elems: JSX.Element[] = [];

            if (markup) {
                if (state.book !== book || state.chapter !== d.chapter_start) {
                    const br: JSX.Element[] = [];
                    if (state.book !== null) {
                        br.push(<p key={br.length + 1} />);
                    }
                    verse_elems.push(
                        <strong key={verse_elems.length + 1}>
                            {br}
                            {book} {d.chapter_start}:{d.verse_start}{" "}
                        </strong>,
                    );
                } else {
                    verse_elems.push(
                        <sup key={verse_elems.length + 1}>
                            <strong>{d.verse_start} </strong>
                        </sup>,
                    );
                }
            }

            if (separateverses) {
                elems.push(
                    <div key={elems.length}>
                        {verse_elems}
                        {renderText(d.text, startingPosition)}
                    </div>,
                );
            } else {
                elems.push(
                    <span key={elems.length}>
                        {verse_elems}
                        {renderText(d.text, startingPosition)}
                    </span>,
                );
            }
        }

        state = {
            ...state,
            book: book,
            chapter: d.chapter_end,
            verse: d.verse_end,
        };
    }

    return <div className={"scripture-text " + languageClass(module.language)}>{elems}</div>;
};
