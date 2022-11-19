import { RenderElementProps, useFocused, useSelected } from "slate-react";
import { NonEditableStyle } from "./Style";

export const VerseRef: React.FC<React.PropsWithChildren<RenderElementProps>> = ({ attributes, children, element }) => {
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
