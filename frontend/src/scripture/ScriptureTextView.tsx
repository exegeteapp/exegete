import React from "react";
import { ScriptureObject, ScriptureWord } from "./ScriptureAPI";
import { ModuleInfo } from "./ScriptureCatalog";

interface RenderState {
    book: string | null;
    chapter: number | null;
    verse: number | null;
}

export const ScriptureTextView: React.FC<{
    module: ModuleInfo;
    book: string;
    shortcode: string;
    scriptures: ScriptureObject[] | null;
    last_scripture_object: ScriptureObject | null;
    last_book: string | null;
    markup: boolean;
}> = ({ module, shortcode, scriptures, last_book, book, last_scripture_object, markup }) => {
    if (!scriptures) {
        return <></>;
    }
    var state: RenderState = {
        book: last_book,
        chapter: last_scripture_object ? last_scripture_object.chapter_end : null,
        verse: last_scripture_object ? last_scripture_object.verse_end : null,
    };

    const languageClass = (language: string) => {
        if (language === "ecg") {
            return "biblical-text-greek";
        } else if (language === "hbo") {
            return "biblical-text-hebrew";
        } else {
            return "biblical-text-english";
        }
    };

    const renderText = (words: ScriptureWord[]) => {
        return words.map((text, i) => {
            let className = "";
            if (text.language && text.language !== module.language) {
                className = languageClass(text.language);
            }
            return (
                <span key={i}>
                    <span className={className} key={i}>
                        {text.value}
                    </span>{" "}
                </span>
            );
        });
    };

    const elems: JSX.Element[] = [];
    for (let i = 0; i < scriptures.length; ++i) {
        const d = scriptures[i];

        if (d.type === "title") {
            if (markup) {
                elems.push(<h2 key={i}>{renderText(d.text)}</h2>);
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
                        </strong>
                    );
                } else {
                    verse_elems.push(
                        <sup key={verse_elems.length + 1}>
                            <strong>{d.verse_start} </strong>
                        </sup>
                    );
                }
            }

            elems.push(
                <span key={i}>
                    {verse_elems}
                    {renderText(d.text)}
                </span>
            );
        }

        state.book = book;
        state.chapter = d.chapter_end;
        state.verse = d.verse_end;
    }

    return <div className={"scripture-text " + languageClass(module.language)}>{elems}</div>;
};
