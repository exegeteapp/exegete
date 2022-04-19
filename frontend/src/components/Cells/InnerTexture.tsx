import { CellFC, NewCellDataFn, WorkspaceData } from "../../workspace/Workspace";
import React, { useEffect } from "react";
import parseReference from "../../verseref/VerseRef";
import { IScriptureContext, ScriptureContext } from "../../scripture/Scripture";
import { getScripture } from "../../scripture/ScriptureAPI";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { getModuleParser } from "../../scripture/ParserCache";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import { Link } from "react-router-dom";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { ScriptureEditor } from "../ScriptureEditor";

export interface InnerTextureData {
    shortcode: string;
    verseref: string;
}

export const InnerTextureSlug = "inner-texture";

export const newInnerTexture: NewCellDataFn<InnerTextureData> = (workspace: WorkspaceData) => {
    // if possible, we just clone the last cell
    for (let i = workspace.cells.length - 1; i >= 0; i--) {
        const cell = workspace.cells[i];
        if (cell.cell_type === InnerTextureSlug) {
            return { ...cell.data };
        }
    }
    return {
        shortcode: "NET",
        verseref: "Matthew 6:26-34",
    };
};

export const InnerTexture: CellFC<InnerTextureData> = ({ cell, functions }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const data = cell.data;

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
                }
            });
        }

        return () => {
            isSubscribed = false;
        };
    }, [scriptureState.catalog, scriptureState.valid, data.shortcode, data.verseref]);

    if (!scriptureState.valid || !scriptureState.catalog) {
        return <div>Loading...</div>;
    }

    const updateVR = (vr: SCVerseRef) => {
        functions.set({
            ...cell.data,
            ...vr,
        });
    };

    return (
        <Cell>
            <CellHeader functions={functions} uuid={cell.uuid}>
                <VerseRefPicker data={{ shortcode: data.shortcode, verseref: data.verseref }} setData={updateVR} />
            </CellHeader>
            <CellBody>
                <ScriptureEditor />
            </CellBody>
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

export default InnerTexture;

export const InnerTextureDefinition: RegistryEntry = {
    title: "Inner texture",
    component: InnerTexture,
    newData: newInnerTexture,
};
