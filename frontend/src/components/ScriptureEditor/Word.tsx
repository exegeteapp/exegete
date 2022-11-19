import { RenderElementProps, useFocused, useSelected } from "slate-react";
import { getSource } from "../../sources/Sources";
import { NonEditableStyle } from "./Style";

export const Word: React.FC<React.PropsWithChildren<RenderElementProps>> = ({ attributes, children, element }) => {
    const selected = useSelected();
    const focused = useFocused();
    if (element.type !== "word") {
        return <></>;
    }

    const layeredElement = {
        ...element,
        source: element.source ? element.source : element.subStyle.source,
        display: element.display ? element.display : element.subStyle.display,
        highlight: element.highlight ? element.highlight : element.subStyle.highlight,
    };
    const sourceDefn = getSource(layeredElement.source);

    let td = "none";
    if (layeredElement.display === "strikethrough" && layeredElement.highlight) {
        td = "underline line-through";
    } else if (layeredElement.display === "strikethrough") {
        td = "line-through";
    } else if (layeredElement.highlight) {
        td = "underline";
    }

    const style: React.CSSProperties = {
        ...NonEditableStyle(selected, focused),
        textDecoration: td,
        opacity: layeredElement.display === "hidden" ? "25%" : "100%",
        color: sourceDefn ? sourceDefn.colour : "black",
        textDecorationColor: layeredElement.highlight ? layeredElement.highlight : "",
        textDecorationThickness: layeredElement.highlight ? "5px" : "",
        textDecorationSkipInk: "none",
    };
    return (
        <span {...attributes} contentEditable={false} style={style}>
            {layeredElement.value}
            {children}
        </span>
    );
};
