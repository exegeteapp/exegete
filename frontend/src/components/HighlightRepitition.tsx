import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import { useGetScriptureCatalogQuery } from "../api/api";
import { useAppDispatch } from "../exegete/hooks";
import { calculateSnowballAnnotations, calculateSnowballHighlights } from "../scripture/Highlighter";
import { getModuleParser } from "../scripture/ParserCache";
import { getScripture, ScriptureObject } from "../scripture/ScriptureAPI";
import parseReference, { ScriptureBookChapters } from "../verseref/VerseRef";
import { WorkspaceCell } from "../workspace/Types";
import { workspaceCellSet } from "../workspace/Workspace";
import { ScriptureCellData } from "./Cells/Scripture";
import { annoKey, newScriptureWordAnnotation, ScriptureWordAnnotation, WordPosition } from "./ScriptureAnnotation";

export const HighlightRepititionButton: React.FC<
    React.PropsWithChildren<{
        cell: WorkspaceCell<ScriptureCellData>;
        editing: boolean;
    }>
> = ({ cell, editing }) => {
    const { data: catalog } = useGetScriptureCatalogQuery();
    const dispatch = useAppDispatch();

    const HighlightRepitition = () => {
        if (!catalog) {
            return;
        }

        // get the scripture for the resolved ranges on each column
        const column_sbcs: ScriptureBookChapters[] = [];
        const column_promises: Promise<readonly ScriptureObject[]>[][] = [];
        for (let index = 0; index < cell.data.columns.length; index++) {
            const column = cell.data.columns[index];
            const module = catalog[column.shortcode];
            const parser = getModuleParser(module, column.shortcode);
            const res = parseReference(module, parser, column.verseref);
            if (res.success) {
                column_sbcs.push(res.sbcs);
                column_promises.push(res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: column.shortcode })));
            } else {
                return; // we just give up for now; the user can fix their verse references!
            }
        }
        Promise.all(column_promises.map((promises) => Promise.all(promises))).then((column_scriptures) => {
            // do an analysis of stemmed words in that scripture, amalgamated together
            const highlights = calculateSnowballHighlights(column_scriptures);
            // pply highlighting to each column.
            const new_columns = cell.data.columns.map((column, index) => {
                const sbcs = column_sbcs[index];
                const objs = column_scriptures[index];
                const annotations = calculateSnowballAnnotations(column.shortcode, sbcs, objs, highlights);

                const annoMap = new Map<string, [WordPosition, ScriptureWordAnnotation]>();

                for (const [position, a] of column.annotation) {
                    annoMap.set(annoKey(position), [position, a]);
                }
                for (const [position, highlight] of annotations) {
                    const entry = annoMap.get(annoKey(position));
                    if (entry) {
                        annoMap.set(annoKey(position), [entry[0], { ...entry[1], highlight: highlight }]);
                    } else {
                        annoMap.set(annoKey(position), [
                            position,
                            {
                                ...newScriptureWordAnnotation(),
                                highlight: highlight,
                            },
                        ]);
                    }
                }
                const newAnno = Array.from(annoMap).map(([key, [position, annotation]]) => {
                    return [position, annotation];
                });
                return { ...column, annotation: newAnno };
            });
            dispatch(workspaceCellSet([cell.uuid, { ...cell.data, columns: new_columns }]));
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
