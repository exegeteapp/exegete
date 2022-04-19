import { CellFC, NewCellDataFn, WorkspaceData } from "../../workspace/Workspace";
import React, { useEffect } from "react";
import parseReference from "../../verseref/VerseRef";
import { IScriptureContext, ScriptureContext } from "../../scripture/Scripture";
import { getScripture, ScriptureObject } from "../../scripture/ScriptureAPI";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { ScriptureTextView } from "../../scripture/ScriptureTextView";
import { getModuleParser } from "../../scripture/ParserCache";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import { RegistryEntry } from "../../workspace/CellRegistry";

export interface ScriptureCellData {
    shortcode: string;
    verseref: string;
    hidemarkup: boolean;
}

export const ScriptureViewerSlug = "scripture-viewer";

export const newScriptureCell: NewCellDataFn<ScriptureCellData> = (workspace: WorkspaceData) => {
    // if possible, we just clone the last cell
    for (let i = workspace.cells.length - 1; i >= 0; i--) {
        const cell = workspace.cells[i];
        if (cell.cell_type === ScriptureViewerSlug) {
            return { ...cell.data };
        }
    }
    return {
        shortcode: "NET",
        verseref: "Matthew 6:26-34",
        hidemarkup: false,
    };
};

export const ScriptureViewer: CellFC<ScriptureCellData> = ({ cell, functions }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const data = cell.data;
    const [scripture, setScripture] = React.useState<JSX.Element[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        // we use the shortcode and verseref coming in via the cell data
        // if the user wishes to change them, that percolates back up and
        // down into us via cell data
        const module = scriptureState.catalog[data.shortcode];
        const parser = getModuleParser(module, data.shortcode);
        const res = parseReference(module, parser, data.verseref);

        if (res.success) {
            const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: data.shortcode }));
            Promise.all(scripturePromises).then((scriptures) => {
                if (isSubscribed) {
                    const elems: JSX.Element[] = [];
                    for (let i = 0; i < scriptures.length; i++) {
                        // backtrack looking for the previous scripture object displayed
                        let last_scripture_object: ScriptureObject | null = null;
                        for (let j = i - 1; j >= 0; j--) {
                            const s = scriptures[j];
                            if (s && s.length > 0) {
                                last_scripture_object = s[s.length - 1];
                                break;
                            }
                        }
                        const last_book = i > 0 ? res.sbcs[i - 1].book : null;

                        elems.push(
                            <ScriptureTextView
                                shortcode={data.shortcode}
                                last_book={last_book}
                                book={res.sbcs[i].book}
                                key={i}
                                module={module}
                                last_scripture_object={last_scripture_object}
                                scriptures={scriptures[i]}
                                markup={!data.hidemarkup}
                            />
                        );
                    }
                    setScripture(elems);
                }
            });
        } else {
            setScripture([]);
        }

        return () => {
            isSubscribed = false;
        };
    }, [scriptureState.catalog, scriptureState.valid, data.shortcode, data.verseref, data.hidemarkup]);

    if (!scriptureState.valid || !scriptureState.catalog) {
        return <div>Loading...</div>;
    }

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

    return (
        <Cell>
            <CellHeader functions={functions} uuid={cell.uuid} buttons={[<HideButton key={0} />]}>
                <VerseRefPicker data={{ shortcode: data.shortcode, verseref: data.verseref }} setData={updateVR} />
            </CellHeader>
            <CellBody>{scripture}</CellBody>
            <CellFooter>
                <div className="text-end">
                    <Link className="body-link" to={`/module/${data.shortcode}`}>
                        ({data.shortcode})
                    </Link>
                </div>
            </CellFooter>
        </Cell>
    );
};

export const ScriptureViewerDefinition: RegistryEntry = {
    title: "Scripture viewer",
    component: ScriptureViewer,
    newData: newScriptureCell,
};
