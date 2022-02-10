import React from "react";
import { ScriptureObject, ScriptureWord } from "./ScriptureAPI";
import { ModuleInfo } from "./ScriptureCatalog";

export const ScriptureText: React.FC<{ module: ModuleInfo; book: string; data: ScriptureObject[] | null }> = ({
    module,
    data,
}) => {
    if (!data) {
        return <></>;
    }

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

    return <div className={languageClass(module.language)}>{elems}</div>;
};
