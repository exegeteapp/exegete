import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import { calculateSnowballAnnotations, calculateSnowballHighlights } from "../scripture/Highlighter";
import { getModuleParser } from "../scripture/ParserCache";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { ScriptureBookChapter } from "../scripture/ScriptureAPI";
import parseReference from "../verseref/VerseRef";
import { IWorkspaceContext, WorkspaceCell, workspaceCellSet, WorkspaceContext } from "../workspace/Workspace";
import { ScriptureCellColumn, ScriptureCellData } from "./Cells/Scripture";
import { annoKey, newScriptureWordAnnotation, ScriptureWordAnnotation, WordPosition } from "./ScriptureAnnotation";

export const HighlightRepititionButton: React.FC<{
    columns: ScriptureCellColumn[];
    editing: boolean;
    cell: WorkspaceCell<ScriptureCellData>;
}> = ({ cell, editing, columns }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const { dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    const HighlightRepitition = () => {
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        const setAnnotation = (new_annotations: [WordPosition, ScriptureWordAnnotation][][]) => {
            const new_columns = cell.data.columns.map((column, i) => {
                return { ...column, annotation: new_annotations[i] };
            });
            workspaceCellSet(dispatch, cell.uuid, {
                ...cell.data,
                columns: new_columns,
            });
        };

        // we want to have consistent colouring between the columns, so we do our
        // repitition analysis on all of the columns smooshed together, and then
        // apply it to each column individually.

        const column_sbcs: [string, ScriptureBookChapter[]][] = [];
        for (let index = 0; index < columns.length; index++) {
            const column = columns[index];
            const module = scriptureState.catalog[column.shortcode];
            const parser = getModuleParser(module, column.shortcode);
            const res = parseReference(module, parser, column.verseref);
            if (res.success) {
                column_sbcs.push([column.shortcode, res.sbcs]);
            } else {
                return; // we just give up for now; the user can fix their verse references!
            }
        }

        calculateSnowballHighlights(column_sbcs).then((snowballHighlight) => {
            const promises = [];
            for (let index = 0; index < columns.length; index++) {
                const column = columns[index];
                promises.push(
                    calculateSnowballAnnotations(column.shortcode, column_sbcs[index][1], snowballHighlight).then(
                        (highlights) => {
                            const anno = column.annotation;
                            const annoMap = new Map<string, ScriptureWordAnnotation>();
                            const annotated = new Set<WordPosition>();
                            for (const [position, a] of anno) {
                                annotated.add(position);
                                annoMap.set(annoKey(position), a);
                            }
                            for (const [position, highlight] of highlights) {
                                const wordAnno = annoMap.get(annoKey(position));
                                annotated.add(position);
                                if (wordAnno) {
                                    annoMap.set(annoKey(position), { ...wordAnno, highlight: highlight });
                                } else {
                                    annoMap.set(annoKey(position), {
                                        ...newScriptureWordAnnotation(),
                                        highlight: highlight,
                                    });
                                }
                            }
                            // FIXME: this cast seems unnecessary, but something is confusing typescript
                            return Array.from(annotated).map((pos) => {
                                const key = annoKey(pos);
                                return [pos, annoMap.get(key)!];
                            }) as [WordPosition, ScriptureWordAnnotation][];
                        }
                    )
                );
            }
            Promise.all(promises).then((newAnnotation) => {
                setAnnotation(newAnnotation);
            });
        });
    };

    const id = `highlight${cell.uuid}`;
    return (
        <Button id={id} onClick={() => HighlightRepitition()} disabled={editing}>
            <FontAwesomeIcon icon={faRobot} />
            <UncontrolledTooltip autohide placement="bottom" target={id}>
                Highlight repitition
            </UncontrolledTooltip>
        </Button>
    );
};
