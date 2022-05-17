import {
    CellFC,
    IWorkspaceContext,
    WorkspaceAction,
    WorkspaceCell,
    workspaceCellSet,
    WorkspaceContext,
    WorkspaceData,
} from "../../workspace/Workspace";
import React from "react";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { Button, ButtonGroup, Col, Row, UncontrolledTooltip } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faHighlighter, faList, faTags } from "@fortawesome/free-solid-svg-icons";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { ScriptureViewer } from "../ScriptureViewer";
import { ScriptureEditor } from "../ScriptureEditor";
import { ScriptureWordAnnotation, ScriptureWordAnnotationFunctions, WordPosition } from "../ScriptureAnnotation";
import { ModuleButton } from "../ModuleButton";
import { HighlightRepititionButton } from "../HighlightRepitition";

export const ScriptureSlug = "scripture";

export interface ScriptureCellColumn {
    shortcode: string;
    verseref: string;
    annotation: [WordPosition, ScriptureWordAnnotation][];
}

export interface ScriptureCellData {
    columns: ScriptureCellColumn[];
    hidemarkup: boolean;
    separateverses: boolean;
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
    // we clone the last cell if it has the same number of columns as our target template
    for (let i = workspace.cells.length - 1; i >= 0; i--) {
        const cell = workspace.cells[i];
        if (cell.cell_type === ScriptureSlug) {
            const cloneData = cell.data as ScriptureCellData;
            if (cloneData.columns && cloneData.columns.length === columns.length) {
                return { ...cell.data };
            }
            break;
        }
    }
    return {
        hidemarkup: hidemarkup,
        columns: columns,
        separateverses: false,
    };
};

const makeSetAnnotation = (cell: WorkspaceCell<ScriptureCellData>, dispatch: React.Dispatch<WorkspaceAction>) => {
    return (index: number, new_annotation: [WordPosition, ScriptureWordAnnotation][]) => {
        const new_columns = [...cell.data.columns];
        new_columns[index].annotation = new_annotation;
        workspaceCellSet(dispatch, cell.uuid, {
            ...cell.data,
            columns: new_columns,
        });
    };
};

const ScriptureColumn: React.FC<{
    index: number;
    cell: WorkspaceCell<ScriptureCellData>;
    editing: boolean;
}> = ({ index, cell, editing }) => {
    const data = cell.data.columns[index];
    const { dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    const sa = makeSetAnnotation(cell, dispatch);
    const annotation_functions: ScriptureWordAnnotationFunctions = {
        get: () => cell.data.columns[index].annotation,
        set: (new_annotation: [WordPosition, ScriptureWordAnnotation][]) => {
            sa(index, new_annotation);
        },
    };

    const inner: JSX.Element = editing ? (
        <ScriptureEditor
            shortcode={data.shortcode}
            verseref={data.verseref}
            annotation={annotation_functions}
            separateverses={cell.data.separateverses}
            hidemarkup={cell.data.hidemarkup}
        />
    ) : (
        <ScriptureViewer
            shortcode={data.shortcode}
            verseref={data.verseref}
            hidemarkup={cell.data.hidemarkup}
            annotation={annotation_functions}
            separateverses={cell.data.separateverses}
        />
    );

    return inner;
};

export const Scripture: CellFC<ScriptureCellData> = ({ cell }) => {
    const data = cell.data;
    const [editing, setEditing] = React.useState(false);
    const { dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    const setHideMarkup = (hidemarkup: boolean) => {
        workspaceCellSet(dispatch, cell.uuid, {
            ...cell.data,
            hidemarkup,
        });
    };

    const setSeparateVerses = (separateverses: boolean) => {
        workspaceCellSet(dispatch, cell.uuid, {
            ...cell.data,
            separateverses,
        });
    };

    const updateVR = (index: number, vr: SCVerseRef) => {
        const new_columns = [...cell.data.columns];
        new_columns[index] = { ...cell.data.columns[index], ...vr };
        workspaceCellSet(dispatch, cell.uuid, {
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
                <ScriptureColumn key={i} index={i} cell={cell} editing={editing} />
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

    const HideMarkupButton: React.FC = () => {
        const id = `hide${cell.uuid}`;
        return (
            <Button
                id={id}
                onClick={() => setHideMarkup(!data.hidemarkup)}
                active={!data.hidemarkup}
                disabled={editing}
            >
                <FontAwesomeIcon icon={faTags} />
                <UncontrolledTooltip autohide placement="bottom" target={id}>
                    {data.hidemarkup ? "Show markup" : "Hide markup"}
                </UncontrolledTooltip>
            </Button>
        );
    };

    const SeparateVersesButton: React.FC = () => {
        const id = `separate${cell.uuid}`;
        return (
            <Button
                id={id}
                onClick={() => setSeparateVerses(!data.separateverses)}
                active={data.separateverses}
                disabled={editing}
            >
                <FontAwesomeIcon icon={faList} />
                <UncontrolledTooltip autohide placement="bottom" target={id}>
                    {data.separateverses ? "Combine verses" : "Separate verses"}
                </UncontrolledTooltip>
            </Button>
        );
    };

    const addColumn = () => {
        const new_column = { ...data.columns[data.columns.length - 1] };
        const new_columns = [...data.columns, new_column];
        workspaceCellSet(dispatch, cell.uuid, {
            ...cell.data,
            columns: new_columns,
        });
    };

    const removeLastColumn = () => {
        const new_columns = data.columns.slice(0, -1);
        workspaceCellSet(dispatch, cell.uuid, {
            ...cell.data,
            columns: new_columns,
        });
    };

    const AddColumnButton: React.FC = () => {
        const id = `add${cell.uuid}`;
        return (
            <Button id={id} onClick={() => addColumn()} disabled={data.columns.length >= 4}>
                <FontAwesomeIcon icon={faArrowRight} />
                <UncontrolledTooltip autohide placement="bottom" target={id}>
                    Add column
                </UncontrolledTooltip>
            </Button>
        );
    };

    const RemoveColumnButton: React.FC = () => {
        const id = `remove${cell.uuid}`;
        return (
            <Button id={id} onClick={() => removeLastColumn()} disabled={data.columns.length <= 1}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <UncontrolledTooltip autohide placement="bottom" target={id}>
                    Remove last column
                </UncontrolledTooltip>
            </Button>
        );
    };

    const AnnotateButton: React.FC = () => {
        const id = `annotate${cell.uuid}`;
        return (
            <Button id={id} onClick={() => setEditing(!editing)} active={editing}>
                <FontAwesomeIcon icon={faHighlighter} />
                <UncontrolledTooltip autohide placement="bottom" target={id}>
                    {editing ? "View text" : "Structure and annotate text"}
                </UncontrolledTooltip>
            </Button>
        );
    };

    return (
        <Cell>
            <CellHeader
                uuid={cell.uuid}
                buttons={[
                    <AnnotateButton key={0} />,
                    <HighlightRepititionButton
                        key={1}
                        editing={editing}
                        cell={cell}
                        columns={data.columns}
                        setAnno={makeSetAnnotation(cell, dispatch)}
                    />,
                    <HideMarkupButton key={2} />,
                    <SeparateVersesButton key={3} />,
                    <RemoveColumnButton key={4} />,
                    <AddColumnButton key={5} />,
                ]}
            ></CellHeader>
            <CellBody>
                <Row className="mb-2">{header}</Row>
                <Row>{inner}</Row>
                <Row>{footer}</Row>
            </CellBody>
            <CellFooter></CellFooter>
        </Cell>
    );
};

export const ScriptureDefinition: RegistryEntry = {
    describe: (data: ScriptureCellData) => {
        const texts = data.columns.map((c) => c.verseref).join(", ");
        const maxl = 20;
        return texts.length > maxl ? texts.slice(0, maxl > 3 ? maxl - 3 : maxl) + "..." : texts;
    },
    component: Scripture,
    launchers: [
        {
            title: "Scripture viewer",
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
                            verseref: "Matthew 3.13-17",
                            annotation: [],
                        },
                        {
                            shortcode: "NET",
                            verseref: "Mark 1.9-11",
                            annotation: [],
                        },
                        {
                            shortcode: "NET",
                            verseref: "Luke 3.21-22",
                            annotation: [],
                        },
                    ],
                    false
                ),
        },
    ],
};
