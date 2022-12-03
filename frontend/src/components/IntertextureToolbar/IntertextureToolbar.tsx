import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import ReactDOM from "react-dom";
import { Button, ButtonGroup, ButtonToolbar } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../../exegete/hooks";
import { selectToolbar, toolbarHide } from "../../exegete/toolbar";
import { EnglishWordSearch, GreekWordStudy } from "./Perseus";
import { IntertextureContext } from "./Types";

export const Portal: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
};

const IntertextureMenu = React.forwardRef<HTMLDivElement, { show: boolean; context: IntertextureContext }>(
    ({ context, show }, ref) => {
        const dispatch = useAppDispatch();
        const buttons = [];
        if (!show) {
            return <></>;
        }

        if (context.language === "ecg") {
            buttons.push(
                <Button key="r" href={GreekWordStudy(context.word)} target="_blank" rel="noreferrer">
                    Perseus study for <strong>"{context.word}"</strong>
                </Button>
            );
        } else if (context.language === "eng") {
            buttons.push(
                <Button key="r" href={EnglishWordSearch(context.word)} target="_blank" rel="noreferrer">
                    Perseus search for <strong>"{context.word}"</strong>
                </Button>
            );
        }

        if (!buttons) {
            return <></>;
        }

        const doClose = () => {
            dispatch(toolbarHide());
        };
        return (
            <div
                className="editor-popupmenu"
                ref={ref}
                onMouseDown={(e) => {
                    // stop focus grab
                    e.preventDefault();
                }}
            >
                <ButtonToolbar className="float-end mb-1">
                    <ButtonGroup>
                        {buttons}
                        <Button key="c">
                            <FontAwesomeIcon icon={faClose} onClick={doClose} />
                        </Button>
                    </ButtonGroup>
                </ButtonToolbar>
            </div>
        );
    }
);

export const IntertextureToolbar: React.FC = () => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const state = useAppSelector(selectToolbar);
    const context = state.data as IntertextureContext;

    React.useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        // we have a word to annotate if there is a void, or there is a string selected
        if (!state.show) {
            el.removeAttribute("style");
            return;
        }

        let top = context.top + window.pageYOffset - el.offsetHeight;
        let left = context.left + window.pageXOffset - el.offsetWidth / 2 + context.width / 2;
        if (left < 5) {
            left = 5;
        }
        el.style.opacity = "1";
        el.style.top = `${top}px`;
        el.style.left = `${left}px`;
    });

    return (
        <Portal>
            <IntertextureMenu ref={ref} show={state.show} context={context} />
        </Portal>
    );
};
