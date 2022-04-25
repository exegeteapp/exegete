import { CellFC, NewCellDataFn, WorkspaceData } from "../../workspace/Workspace";
import React from "react";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { Button, ButtonGroup, ButtonToolbar } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { ScriptureViewer } from "../ScriptureViewer";
import { ScriptureEditor } from "../ScriptureEditor";
import { ScriptureWordAnnotation, ScriptureWordAnnotationFunctions, WordPosition } from "../ScriptureAnnotation";
import { ModuleButton } from "../ModuleButton";

export const ScriptureSlug = "scripture-viewer";

export interface ScriptureCellData {
    shortcode: string;
    verseref: string;
    hidemarkup: boolean;
    annotation: [WordPosition, ScriptureWordAnnotation][];
}

export const newScriptureCell: NewCellDataFn<ScriptureCellData> = (workspace: WorkspaceData): ScriptureCellData => {
    // if possible, we just clone the last cell
    for (let i = workspace.cells.length - 1; i >= 0; i--) {
        const cell = workspace.cells[i];
        if (cell.cell_type === ScriptureSlug) {
            return { ...cell.data };
        }
    }
    return {
        shortcode: "NET",
        verseref: "Matthew 6.26-34",
        hidemarkup: false,
        annotation: [],
    };
};

export const Scripture: CellFC<ScriptureCellData> = ({ cell, functions }) => {
    const data = cell.data;
    const [editing, setEditing] = React.useState(false);

    const setAnnotation = (new_annotation: [WordPosition, ScriptureWordAnnotation][]) => {
        functions.set({
            ...cell.data,
            annotation: new_annotation,
        });
    };

    const annotation_functions: ScriptureWordAnnotationFunctions = {
        get: () => cell.data.annotation,
        set: setAnnotation,
    };

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

    const inner: JSX.Element = editing ? (
        <ScriptureEditor shortcode={data.shortcode} verseref={data.verseref} annotation={annotation_functions} />
    ) : (
        <ScriptureViewer
            shortcode={data.shortcode}
            verseref={data.verseref}
            hidemarkup={data.hidemarkup}
            annotation={annotation_functions}
        />
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
            <CellBody>
                {inner}
                <ButtonGroup className="float-end mb-1">
                    <ModuleButton shortcode={data.shortcode} />
                </ButtonGroup>
            </CellBody>
            <CellFooter>
                <div className="text-end">
                    <ButtonGroup className="float-end mb-1">
                        <Button onClick={() => setEditing(!editing)}>
                            {editing ? "Done" : "Structure and annotate"}
                        </Button>
                    </ButtonGroup>
                </div>
            </CellFooter>
        </Cell>
    );
};

export const ScriptureDefinition: RegistryEntry = {
    component: Scripture,
    launchers: [
        {
            title: "Scripture",
            newData: newScriptureCell,
        },
    ],
};
