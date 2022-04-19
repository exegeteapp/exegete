// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import React from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import useConstant from "use-constant";

type CustomElement = {
    type: "paragraph";
    children: CustomText[];
};

type CustomText = {
    text: string;
};

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [{ text: "A line of text in a paragraph." }],
    },
];

export const ScriptureEditor: React.FC<{}> = () => {
    const editor = useConstant(() => withReact(withHistory(createEditor())));
    // const [value, setValue] = React.useState<Descendant[]>(initialValue);

    const onChange = (value: Descendant[]) => {
        // setValue(value);
    };

    return (
        <Slate editor={editor} value={initialValue} onChange={onChange}>
            <Editable />
        </Slate>
    );
};
