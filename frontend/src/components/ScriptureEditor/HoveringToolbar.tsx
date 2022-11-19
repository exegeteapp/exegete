import { faBrush, faStrikethrough, faTrashCan, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import ReactDOM from "react-dom";
import { Button, ButtonGroup, ButtonToolbar, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Editor, Transforms } from "slate";
import { useFocused, useSlate } from "slate-react";
import { DistinguishableColours } from "../../colours/distinguishable";
import { SourceGroup } from "../../sources/Sources";
import { WordElement } from "./Types";

export const Portal: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
};

const activeOnSelection = (editor: Editor, key: string, value: string): boolean => {
    const [match] = Editor.nodes(editor, {
        match: (node, path) => {
            const word = node as WordElement;
            if (word.type !== "word") {
                return false;
            }
            return (word as any)[key] === value;
        },
    });
    return !!match;
};

const toggleOnSelection = (editor: Editor, key: string, value: string) => {
    const isSet = activeOnSelection(editor, key, value);
    const props = isSet ? { [key]: "" } : { [key]: value };
    Transforms.setNodes(editor, props, {
        match: (node, path) => {
            const word = node as WordElement;
            if (word.type !== "word") {
                return false;
            }
            return true;
        },
        split: false,
        mode: "lowest",
        hanging: true,
    });
};

const ToggleAnnoButton: React.FC<React.PropsWithChildren<{ attr: string; value: string; icon?: IconDefinition }>> = ({
    attr,
    value,
    icon,
}) => {
    const editor = useSlate();
    return (
        <Button
            active={activeOnSelection(editor, attr, value)}
            className="float-end"
            onClick={() => toggleOnSelection(editor, attr, value)}
        >
            {icon ? <FontAwesomeIcon icon={icon} /> : value}
        </Button>
    );
};

const EditorMenu = React.forwardRef<HTMLDivElement, { groups: SourceGroup[] }>(({ groups }, ref) => {
    const editor = useSlate();

    const bgs: React.ReactElement[] = groups.map((group, index) => {
        const btns = group.sources.map((source, index) => {
            return <ToggleAnnoButton attr="source" value={source.code} key={index} />;
        });
        return (
            <ButtonGroup className="pe-1" key={index}>
                {btns}
            </ButtonGroup>
        );
    });

    const colours = DistinguishableColours.map((c, i) => {
        return (
            <Button
                active={activeOnSelection(editor, "highlight", c)}
                key={i}
                onClick={() => toggleOnSelection(editor, "highlight", c)}
                style={{ backgroundColor: c }}
            />
        );
    });

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
                {bgs}
                <ButtonGroup>
                    <UncontrolledDropdown nav className="toolbar-dropdown">
                        <DropdownToggle caret nav>
                            <FontAwesomeIcon icon={faBrush} />
                        </DropdownToggle>
                        <DropdownMenu color="dark" dark>
                            {colours}
                        </DropdownMenu>
                    </UncontrolledDropdown>

                    <ToggleAnnoButton attr="display" value="strikethrough" icon={faStrikethrough} />
                    <ToggleAnnoButton attr="display" value="hidden" icon={faTrashCan} />
                </ButtonGroup>
            </ButtonToolbar>
        </div>
    );
});

export const HoveringToolbar: React.FC<React.PropsWithChildren<{ groups: SourceGroup[] }>> = ({ groups }) => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const editor = useSlate();
    const inFocus = useFocused();

    React.useEffect(() => {
        const el = ref.current;
        const { selection } = editor;

        if (!el) {
            return;
        }

        const showMenu = () => {
            if (!selection || !inFocus) {
                return false;
            }
            // we have a word to annotate if there's at least one word in the selection
            const [match] = Editor.nodes(editor, {
                match: (node, path) => {
                    const word = node as WordElement;
                    if (word.type !== "word") {
                        return false;
                    }
                    return true;
                },
            });
            return !!match;
        };

        // we have a word to annotate if there is a void, or there is a string selected
        if (!showMenu()) {
            el.removeAttribute("style");
            return;
        }

        const domSelection = window.getSelection();
        if (domSelection) {
            const domRange = domSelection.getRangeAt(0);
            const rect = domRange.getBoundingClientRect();
            let top = rect.top + window.pageYOffset - el.offsetHeight;
            let left = rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2;
            if (left < 5) {
                left = 5;
            }
            el.style.opacity = "1";
            el.style.top = `${top}px`;
            el.style.left = `${left}px`;
        }
    });

    return (
        <Portal>
            <EditorMenu ref={ref} groups={groups} />
        </Portal>
    );
};
