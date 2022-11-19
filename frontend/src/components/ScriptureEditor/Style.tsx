export const NonEditableStyle = (selected: boolean, focused: boolean): React.CSSProperties => {
    return {
        verticalAlign: "baseline",
        display: "inline-block",
        backgroundColor: "#eee",
        boxShadow: selected && focused ? "0 0 0 2px #B4D5FF" : "none",
    };
};
