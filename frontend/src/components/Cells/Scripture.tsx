import { CellFC, selectWorkspaceCell, workspaceCellSet } from "../../workspace/Workspace";
import React from "react";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { Button, ButtonGroup, Col, Row, UncontrolledTooltip } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faHighlighter, faList, faTags } from "@fortawesome/free-solid-svg-icons";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { ScriptureViewer } from "../ScriptureViewer";
import { ScriptureEditor } from "../ScriptureEditor";
import {
    mergeAnnotationArray,
    ScriptureWordAnnotation,
    ScriptureWordAnnotationFunctions,
    WordPosition,
} from "../../scripture/ScriptureAnnotation";
import { ModuleButton } from "../ModuleButton";
import { HighlightRepetitionButton } from "../HighlightRepetition";
import { useAppDispatch, useAppSelector } from "../../exegete/hooks";
import { WorkspaceData } from "../../workspace/Types";

export const ScriptureSlug = "scripture";

export type AnnotationArray = ReadonlyArray<readonly [WordPosition, ScriptureWordAnnotation]>;

export interface ScriptureCellColumn {
    readonly shortcode: string;
    readonly verseref: string;
    readonly annotation: AnnotationArray;
    readonly repAnnotation: AnnotationArray;
}

export interface ScriptureCellData {
    readonly columns: ScriptureCellColumn[];
    readonly hidemarkup: boolean;
    readonly separateverses: boolean;
}

const columnWidth: { [key: number]: number } = {
    4: 3,
    3: 4,
    2: 6,
    1: 12,
};

export const newScriptureCell = (
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
        separateverses: true,
    };
};

const ScriptureColumn: React.FC<
    React.PropsWithChildren<{
        index: number;
        data: ScriptureCellColumn;
        editing: boolean;
        hidemarkup: boolean;
        separateverses: boolean;
        setAnnotation: (index: number, new_annotation: [WordPosition, ScriptureWordAnnotation][]) => void;
    }>
> = ({ index, data, editing, hidemarkup, separateverses, setAnnotation }) => {
    const [mergedAnnotation, setMergedAnnotation] = React.useState<AnnotationArray>([]);

    React.useEffect(() => {
        const merged = mergeAnnotationArray(data.repAnnotation, data.annotation);
        setMergedAnnotation(merged);
    }, [data.annotation, data.repAnnotation]);

    const merged_annotation_functions: ScriptureWordAnnotationFunctions = {
        get: () => {
            return mergedAnnotation;
        },
        set: (data) => setAnnotation(index, data),
    };

    const annotation_functions: ScriptureWordAnnotationFunctions = {
        get: () => {
            return data.annotation;
        },
        set: (data) => setAnnotation(index, data),
    };

    const inner: JSX.Element = editing ? (
        <ScriptureEditor
            shortcode={data.shortcode}
            verseref={data.verseref}
            annotation={annotation_functions}
            repAnnotation={data.repAnnotation}
            separateverses={separateverses}
            hidemarkup={hidemarkup}
        />
    ) : (
        <ScriptureViewer
            shortcode={data.shortcode}
            verseref={data.verseref}
            hidemarkup={hidemarkup}
            annotation={merged_annotation_functions}
            separateverses={separateverses}
        />
    );

    return inner;
};

export const Scripture: CellFC = ({ uuid }) => {
    const cell = useAppSelector(selectWorkspaceCell(uuid));
    const [editing, setEditing] = React.useState(false);
    const dispatch = useAppDispatch();

    if (!cell) {
        return <></>;
    }
    const data = cell.data;

    const toggleEditor = () => {
        setEditing(!editing);
    };

    const setHideMarkup = (hidemarkup: boolean) => {
        dispatch(
            workspaceCellSet([
                cell.uuid,
                {
                    ...cell.data,
                    hidemarkup,
                },
            ])
        );
    };

    const setSeparateVerses = (separateverses: boolean) => {
        dispatch(
            workspaceCellSet([
                cell.uuid,
                {
                    ...cell.data,
                    separateverses,
                },
            ])
        );
    };

    const updateVR = (index: number, vr: SCVerseRef) => {
        const new_columns = [...cell.data.columns];
        new_columns[index] = { ...cell.data.columns[index], ...vr };
        dispatch(
            workspaceCellSet([
                cell.uuid,
                {
                    ...cell.data,
                    columns: new_columns,
                },
            ])
        );
    };

    const setAnnotation = (index: number, new_annotation: [WordPosition, ScriptureWordAnnotation][]) => {
        const new_columns = [...cell.data.columns];
        new_columns[index] = { ...new_columns[index], annotation: new_annotation };
        dispatch(
            workspaceCellSet([
                cell.uuid,
                {
                    ...cell.data,
                    columns: new_columns,
                },
            ])
        );
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
                <ScriptureColumn
                    setAnnotation={setAnnotation}
                    key={i}
                    index={i}
                    data={data.columns[i]}
                    hidemarkup={data.hidemarkup}
                    separateverses={data.separateverses}
                    editing={editing}
                />
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

    const HideMarkupButton: React.FC<React.PropsWithChildren<unknown>> = () => {
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

    const SeparateVersesButton: React.FC<React.PropsWithChildren<unknown>> = () => {
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
        dispatch(
            workspaceCellSet([
                cell.uuid,
                {
                    ...cell.data,
                    columns: new_columns,
                },
            ])
        );
    };

    const removeLastColumn = () => {
        const new_columns = data.columns.slice(0, -1);
        dispatch(
            workspaceCellSet([
                cell.uuid,
                {
                    ...cell.data,
                    columns: new_columns,
                },
            ])
        );
    };

    const AddColumnButton: React.FC<React.PropsWithChildren<unknown>> = () => {
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

    const RemoveColumnButton: React.FC<React.PropsWithChildren<unknown>> = () => {
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

    const AnnotateButton: React.FC<React.PropsWithChildren<unknown>> = () => {
        const id = `annotate${cell.uuid}`;
        return (
            <Button id={id} onClick={() => toggleEditor()} active={editing}>
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
                    <HighlightRepetitionButton key={1} editing={editing} cell={cell} />,
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
                newScriptureCell(
                    d,
                    [
                        {
                            shortcode: "NET",
                            verseref: "Matthew 6.26-34",
                            annotation: [],
                            repAnnotation: [],
                        },
                    ],
                    false
                ),
        },
        {
            title: "Parallel texts",
            newData: (d) =>
                newScriptureCell(
                    d,
                    [
                        {
                            shortcode: "NET",
                            verseref: "Matthew 3.13-17",
                            annotation: [],
                            repAnnotation: [],
                        },
                        {
                            shortcode: "NET",
                            verseref: "Mark 1.9-11",
                            annotation: [],
                            repAnnotation: [],
                        },
                        {
                            shortcode: "NET",
                            verseref: "Luke 3.21-22",
                            annotation: [],
                            repAnnotation: [],
                        },
                    ],
                    false
                ),
        },
    ],
};
