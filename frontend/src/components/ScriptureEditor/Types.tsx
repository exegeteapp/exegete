import { BaseEditor } from "slate";
import { WordPosition } from "../../scripture/ScriptureAnnotation";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type ParaElement = {
    type: "paragraph";
    children: (CustomElement | CustomText)[];
};

export type WordAnnotation = {
    source: string;
    display: string;
    highlight: string;
};

export type VerseRefElement = {
    type: "verseref";
    value: string;
    children: CustomText[];
};

export type WordElement = {
    type: "word";
    value: string;
    start_of_verse: boolean;
    children: CustomText[];
    position: WordPosition;
    subStyle: WordAnnotation;
} & WordAnnotation;

export type CustomText = {
    type: "text";
    text: string;
};

export type CustomElement = ParaElement | WordElement | VerseRefElement;

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}
