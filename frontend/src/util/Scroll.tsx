import { useLocation } from "react-router-dom";
import React from "react";
import { CellRefs } from "../components/Routes/Workspace/Types";

const calcTargetY = (ref: HTMLDivElement) => {
    return ref.getBoundingClientRect().top + window.pageYOffset - 60; // bootstrap top menu
};

export const ScrollToLastCell = (refs: CellRefs) => {
    for (let j = refs.current.length - 1; j >= 0; j--) {
        const ref = refs.current[j];
        if (ref) {
            window.scrollTo({ top: calcTargetY(ref), behavior: "smooth" });
            return;
        }
    }
};

export const ScrollToCell = (refs: CellRefs, index: number) => {
    if (refs) {
        const ref = refs.current[index];
        if (ref) {
            window.scrollTo({ top: calcTargetY(ref), behavior: "smooth" });
        }
    }
};

// credit: https://stackoverflow.com/a/61602724
export default function ScrollToTop() {
    const { pathname } = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
