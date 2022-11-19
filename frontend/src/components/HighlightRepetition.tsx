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
import { newScriptureWordAnnotation } from "../scripture/ScriptureAnnotation";

export const HighlightRepetitionButton: React.FC<
    React.PropsWithChildren<{
        cell: WorkspaceCell<ScriptureCellData>;
        editing: boolean;
    }>
> = ({ cell, editing }) => {
    const { data: catalog } = useGetScriptureCatalogQuery();
    const dispatch = useAppDispatch();

    const haveRepAnnotations = cell.data.columns.some((column) => column.repAnnotation.length > 0);

    const toggleHighlightRepetition = () => {
        if (haveRepAnnotations) {
            // toggle off by removing all repAnnotations
            const new_columns = cell.data.columns.map((column) => ({
                ...column,
                repAnnotation: [],
            }));
            dispatch(workspaceCellSet([cell.uuid, { ...cell.data, columns: new_columns }]));
            return;
        }

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
                const newAnno = Array.from(annotations).map(([position, highlight]) => {
                    return [position, { ...newScriptureWordAnnotation(), highlight: highlight }];
                });
                return { ...column, repAnnotation: newAnno };
            });
            dispatch(workspaceCellSet([cell.uuid, { ...cell.data, columns: new_columns }]));
        });
    };

    const id = `highlight${cell.uuid}`;
    return (
        <Button id={id} active={haveRepAnnotations} onClick={() => toggleHighlightRepetition()} disabled={editing}>
            <FontAwesomeIcon icon={faRobot} />
            <UncontrolledTooltip autohide placement="bottom" target={id}>
                Highlight repetition
            </UncontrolledTooltip>
        </Button>
    );
};
