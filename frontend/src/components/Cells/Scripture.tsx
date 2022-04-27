import { CellFC, CellFunctions, WorkspaceCell, WorkspaceData } from "../../workspace/Workspace";
import React from "react";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { Button, ButtonGroup, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faTags } from "@fortawesome/free-solid-svg-icons";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { ScriptureViewer } from "../ScriptureViewer";
import { ScriptureEditor } from "../ScriptureEditor";
import { ScriptureWordAnnotation, ScriptureWordAnnotationFunctions, WordPosition } from "../ScriptureAnnotation";
import { ModuleButton } from "../ModuleButton";

export const ScriptureSlug = "scripture";

interface ScriptureCellColumn {
    shortcode: string;
    verseref: string;
    annotation: [WordPosition, ScriptureWordAnnotation][];
}

export interface ScriptureCellData {
    columns: ScriptureCellColumn[];
    hidemarkup: boolean;
}

const columnWidth: { [key: number]: number } = {
    4: 3,
    3: 4,
    2: 6,
    1: 12,
};

export const newScriptureCellParallel = (
    workspace: WorkspaceData,
    columns: ScriptureCellColumn[],
    hidemarkup: boolean
): ScriptureCellData => {
    // if possible, we just clone the last cell
    for (let i = workspace.cells.length - 1; i >= 0; i--) {
        const cell = workspace.cells[i];
        if (cell.cell_type === ScriptureSlug) {
            return { ...cell.data };
        }
    }
    return {
        hidemarkup: false,
        columns: [],
    };
};

const ScriptureColumn: React.FC<{
    index: number;
    cell: WorkspaceCell<ScriptureCellData>;
    functions: CellFunctions;
    editing: boolean;
}> = ({ index, cell, functions, editing }) => {
    const data = cell.data.columns[index];

    const setAnnotation = (new_annotation: [WordPosition, ScriptureWordAnnotation][]) => {
        const new_columns = [...cell.data.columns];
        new_columns[index].annotation = new_annotation;
        functions.set({
            ...cell.data,
            columns: new_columns,
        });
    };

    const annotation_functions: ScriptureWordAnnotationFunctions = {
        get: () => cell.data.columns[index].annotation,
        set: setAnnotation,
    };

    const inner: JSX.Element = editing ? (
        <ScriptureEditor shortcode={data.shortcode} verseref={data.verseref} annotation={annotation_functions} />
    ) : (
        <ScriptureViewer
            shortcode={data.shortcode}
            verseref={data.verseref}
            hidemarkup={cell.data.hidemarkup}
            annotation={annotation_functions}
        />
    );

    return inner;
};

export const Scripture: CellFC<ScriptureCellData> = ({ cell, functions }) => {
    const data = cell.data;
    const [editing, setEditing] = React.useState(false);

    const setHideMarkup = (hidemarkup: boolean) => {
        functions.set({
            ...cell.data,
            hidemarkup,
        });
    };

    const updateVR = (index: number, vr: SCVerseRef) => {
        const new_columns = [...cell.data.columns];
        new_columns[index] = { ...cell.data.columns[index], ...vr };
        functions.set({
            ...cell.data,
            columns: new_columns,
        });
    };

    const cw = columnWidth[cell.data.columns.length] || 3;
    const header: JSX.Element[] = [];
    const inner: JSX.Element[] = [];
    const footer: JSX.Element[] = [];

    for (let i = 0; i < data.columns.length; i++) {
        if (editing) {
            header.push(
                <Col xs={{ size: cw, offset: 0 }} key={i}>
                    <p>
                        <strong>{data.columns[i].verseref}</strong>
                    </p>
                </Col>
            );
        } else {
            header.push(
                <Col xs={{ size: cw, offset: 0 }} key={i}>
                    <VerseRefPicker
                        small={true}
                        data={{ shortcode: data.columns[i].shortcode, verseref: data.columns[i].verseref }}
                        setData={(vr) => updateVR(i, vr)}
                    />
                </Col>
            );
        }
        inner.push(
            <Col xs={{ size: cw, offset: 0 }} key={i}>
                <ScriptureColumn key={i} index={i} cell={cell} functions={functions} editing={editing} />
            </Col>
        );
        footer.push(
            <Col xs={{ size: cw, offset: 0 }} key={i}>
                <ButtonGroup className="float-end mb-1">
                    <ModuleButton shortcode={data.columns[i].shortcode} />
                </ButtonGroup>
            </Col>
        );
    }

    const HideButton: React.FC = () => {
        return (
            <Button onClick={() => setHideMarkup(!data.hidemarkup)} active={!data.hidemarkup}>
                <FontAwesomeIcon icon={faTags} />
            </Button>
        );
    };

    const addColumn = () => {
        const new_column = { ...data.columns[data.columns.length - 1] };
        const new_columns = [...data.columns, new_column];
        functions.set({
            ...cell.data,
            columns: new_columns,
        });
    };

    const removeLastColumn = () => {
        const new_columns = data.columns.slice(0, -1);
        functions.set({
            ...cell.data,
            columns: new_columns,
        });
    };

    const AddColumnButton: React.FC = () => {
        if (data.columns.length >= 4) {
            return <></>;
        }
        return (
            <Button onClick={() => addColumn()}>
                <FontAwesomeIcon icon={faArrowRight} />
            </Button>
        );
    };

    const RemoveColumnButton: React.FC = () => {
        if (data.columns.length <= 2) {
            return <></>;
        }
        return (
            <Button onClick={() => removeLastColumn()}>
                <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
        );
    };

    return (
        <Cell>
            <CellHeader
                functions={functions}
                uuid={cell.uuid}
                buttons={[<RemoveColumnButton key={1} />, <AddColumnButton key={2} />, <HideButton key={3} />]}
            ></CellHeader>
            <CellBody>
                <Row className="mb-2">{header}</Row>
                <Row>{inner}</Row>
                <Row>{footer}</Row>
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
            title: "Parallel texts",
            newData: (d) =>
                newScriptureCellParallel(
                    d,
                    [
                        {
                            shortcode: "NET",
                            verseref: "Matthew 6.26-34",
                            annotation: [],
                        },
                    ],
                    false
                ),
        },
        {
            title: "Parallel texts",
            newData: (d) =>
                newScriptureCellParallel(
                    d,
                    [
                        {
                            shortcode: "NET",
                            verseref: "Matthew 6.26-34",
                            annotation: [],
                        },
                    ],
                    false
                ),
        },
    ],
};
