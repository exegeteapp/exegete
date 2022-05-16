import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import { calculateSnowballAnnotations, calculateSnowballHighlights } from "../scripture/Highlighter";
import { getModuleParser } from "../scripture/ParserCache";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import { ScriptureBookChapter } from "../scripture/ScriptureAPI";
import parseReference from "../verseref/VerseRef";
import { WorkspaceCell } from "../workspace/Workspace";
import { ScriptureCellColumn, ScriptureCellData } from "./Cells/Scripture";
import { annoKey, newScriptureWordAnnotation, ScriptureWordAnnotation, WordPosition } from "./ScriptureAnnotation";

export const HighlightRepititionButton: React.FC<{
    columns: ScriptureCellColumn[];
    editing: boolean;
    cell: WorkspaceCell<ScriptureCellData>;
    setAnno: (index: number, new_annotation: [WordPosition, ScriptureWordAnnotation][]) => void;
}> = ({ cell, editing, columns, setAnno }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const HighlightRepitition = () => {
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

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
            for (let index = 0; index < columns.length; index++) {
                const column = columns[index];
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
                                wordAnno.highlight = highlight;
                            } else {
                                const newAnno = newScriptureWordAnnotation();
                                newAnno.highlight = highlight;
                                annoMap.set(annoKey(position), newAnno);
                            }
                        }
                        setAnno(
                            index,
                            Array.from(annotated).map((pos) => {
                                const key = annoKey(pos);
                                return [pos, annoMap.get(key)!];
                            })
                        );
                    }
                );
            }
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
