import React from "react";

export const ScrollWrapper = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
    return <div ref={ref}>{props.children}</div>;
});
