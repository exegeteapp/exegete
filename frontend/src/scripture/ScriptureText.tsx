import React from "react";
import { ScriptureObject, ScriptureWord } from "./ScriptureAPI";
import { ModuleInfo } from "./ScriptureCatalog";

interface RenderState {
    book: string | null;
    chapter: number | null;
    verse: number | null;
}

export const ScriptureText: React.FC<{
    module: ModuleInfo;
    book: string;
    data: ScriptureObject[] | null;
    last_scripture_object: ScriptureObject | null;
    last_book: string | null;
    markup: boolean;
}> = ({ module, data, last_book, book, last_scripture_object, markup }) => {
    if (!data) {
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

    const renderText = (text: ScriptureWord[]) => {
        return text.map((word, i) => {
            let className = "";
            if (word.language && word.language !== module.language) {
                className = languageClass(word.language);
            }
            return (
                <span className={className} key={i}>
                    {word.value}
                </span>
            );
        });
    };

    const elems: JSX.Element[] = [];
    for (let i = 0; i < data.length; ++i) {
        const d = data[i];

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
