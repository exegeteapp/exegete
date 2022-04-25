import { CellFC, CellFunctions, NewCellDataFn, WorkspaceCell, WorkspaceData } from "../../workspace/Workspace";
import React from "react";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { Button, ButtonGroup, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { ScriptureViewer } from "../ScriptureViewer";
import { ScriptureEditor } from "../ScriptureEditor";
import { ScriptureWordAnnotation, ScriptureWordAnnotationFunctions, WordPosition } from "../ScriptureAnnotation";
import { ModuleButton } from "../ModuleButton";

export const ParallelSlug = "parallel";

interface ParallelCellColumn {
    shortcode: string;
    verseref: string;
    annotation: [WordPosition, ScriptureWordAnnotation][];
}

export interface ParallelCellData {
    columns: ParallelCellColumn[];
    hidemarkup: boolean;
}

const ParallelColumn: React.FC<{
    index: number;
    cell: WorkspaceCell<ParallelCellData>;
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

export const Parallel: CellFC<ParallelCellData> = ({ cell, functions }) => {
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

    if (!data.columns || (data.columns.length !== 3 && data.columns.length !== 4)) {
        return <div>Unsupported column definitions for parallel viewer</div>;
    }

    // markdown width of our columns.
    const cw = data.columns.length === 3 ? 4 : 3;

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
                <ParallelColumn key={i} index={i} cell={cell} functions={functions} editing={editing} />
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
            <ButtonGroup>
                <Button onClick={() => setHideMarkup(!data.hidemarkup)} active={!data.hidemarkup}>
                    <FontAwesomeIcon icon={faTags} />
                </Button>
            </ButtonGroup>
        );
    };

    return (
        <Cell>
            <CellHeader functions={functions} uuid={cell.uuid} buttons={[<HideButton key={0} />]}></CellHeader>
            <CellBody>
                <Row>{header}</Row>
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

export const newParallel3Cell: NewCellDataFn<ParallelCellData> = (workspace: WorkspaceData): ParallelCellData => {
    return {
        hidemarkup: true,
        columns: [
            {
                shortcode: "NET",
                verseref: "Matthew 14.3-4",
                annotation: [],
            },
            {
                shortcode: "NET",
                verseref: "Mark 6.17-18",
                annotation: [],
            },
            {
                shortcode: "NET",
                verseref: "Luke 3.19-20",
                annotation: [],
            },
        ],
    };
};

export const newParallel4Cell: NewCellDataFn<ParallelCellData> = (workspace: WorkspaceData): ParallelCellData => {
    return {
        hidemarkup: true,
        columns: [
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
            {
                shortcode: "NET",
                verseref: "John 1.29-34",
                annotation: [],
            },
        ],
    };
};

export const ParallelDefinition: RegistryEntry = {
    component: Parallel,
    launchers: [
        {
            title: "Parallel (3 Columns)",
            newData: newParallel3Cell,
        },
        {
            title: "Parallel (4 Columns)",
            newData: newParallel4Cell,
        },
    ],
};
