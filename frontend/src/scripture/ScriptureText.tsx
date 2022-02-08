import React from "react";
import { ScriptureObject, ScriptureWord } from "./ScriptureAPI";

export const ScriptureText: React.FC<{ data: ScriptureObject[] | null }> = ({ data }) => {
    if (!data) {
        return <></>;
    }
    const renderText = (text: ScriptureWord[]) => {
        return text.map((word, i) => {
            if (word.br) {
                return <span key={i}>{word.value}</span>;
            }
            return <span key={i}>{word.value}</span>;
        });
    };
    const elems = data.map((d, i) => {
        if (d.type === "title") {
            return <h2 key={i}>{renderText(d.text)}</h2>;
        } else if (d.type === "verse") {
            return (
                <span key={i}>
                    <b>
                        <sup>{d.verse_start}</sup>
                    </b>{" "}
                    {renderText(d.text)}
                </span>
            );
        } else if (d.type === "footnote") {
            // ignored for now
            return <span key={i} />;
        } else {
            // ignored for now
            return <span key={i} />;
        }
    });
    return <>{elems}</>;
};
