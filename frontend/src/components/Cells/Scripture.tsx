import { CellFC, NewCellDataFn, WorkspaceData } from "../../workspace/Workspace";
import React from "react";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { useNavigate } from "react-router-dom";
import { Button, ButtonGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { ScriptureViewer } from "../ScriptureViewer";
import { ScriptureEditor } from "../ScriptureEditor";

export interface ScriptureCellData {
    shortcode: string;
    verseref: string;
    hidemarkup: boolean;
}

export const ScriptureSlug = "scripture-viewer";

export const newScriptureCell: NewCellDataFn<ScriptureCellData> = (workspace: WorkspaceData) => {
    // if possible, we just clone the last cell
    for (let i = workspace.cells.length - 1; i >= 0; i--) {
        const cell = workspace.cells[i];
        if (cell.cell_type === ScriptureSlug) {
            return { ...cell.data };
        }
    }
    return {
        shortcode: "NET",
        verseref: "Matthew 6:26-34",
        hidemarkup: false,
    };
};

export const Scripture: CellFC<ScriptureCellData> = ({ cell, functions }) => {
    const data = cell.data;
    const [editing, setEditing] = React.useState(false);
    const navigate = useNavigate();

    const updateVR = (vr: SCVerseRef) => {
        functions.set({
            ...cell.data,
            ...vr,
        });
    };

    const setHideMarkup = (hidemarkup: boolean) => {
        functions.set({
            ...cell.data,
            hidemarkup,
        });
    };

    const HideButton: React.FC = () => {
        return (
            <Button onClick={() => setHideMarkup(!data.hidemarkup)} active={!data.hidemarkup}>
                <FontAwesomeIcon icon={faTags} />
            </Button>
        );
    };

    const goToModule = () => {
        navigate(`/module/${data.shortcode}`);
    };

    const inner: JSX.Element = editing ? (
        <ScriptureEditor shortcode={data.shortcode} verseref={data.verseref} />
    ) : (
        <ScriptureViewer shortcode={data.shortcode} verseref={data.verseref} hidemarkup={data.hidemarkup} />
    );

    const header: JSX.Element = editing ? (
        <>Structure and annotate: {data.verseref}</>
    ) : (
        <VerseRefPicker data={{ shortcode: data.shortcode, verseref: data.verseref }} setData={updateVR} />
    );

    return (
        <Cell>
            <CellHeader functions={functions} uuid={cell.uuid} buttons={[<HideButton key={0} />]}>
                {header}
            </CellHeader>
            <CellBody>{inner}</CellBody>
            <CellFooter>
                <div className="text-end">
                    <ButtonGroup className="float-end mb-1">
                        <Button onClick={() => setEditing(!editing)}>
                            {editing ? "Done" : "Structure and annotate"}
                        </Button>
                        <Button onClick={() => goToModule()}>({data.shortcode})</Button>
                    </ButtonGroup>
                </div>
            </CellFooter>
        </Cell>
    );
};

export const ScriptureDefinition: RegistryEntry = {
    title: "Scripture",
    component: Scripture,
    newData: newScriptureCell,
};
