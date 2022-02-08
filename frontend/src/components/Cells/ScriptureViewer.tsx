import { CellFC } from "../../workspace/Workspace";
import React, { useEffect } from "react";
import { Card, CardBody, CardText, CardHeader } from "reactstrap";
import parseReference, { makeModuleParser } from "../../verseref/VerseRef";
import { IScriptureContext, ScriptureContext } from "../../scripture/Scripture";
import { getScripture } from "../../scripture/ScriptureAPI";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { ScriptureText } from "../../scripture/ScriptureText";

export interface ScriptureCellData {
    shortcode: string;
    verseref: string;
}

export const ScriptureViewer: CellFC<ScriptureCellData> = ({ cell, setCell }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const data = cell.data;
    const [scripture, setScripture] = React.useState<JSX.Element[]>([]);

    useEffect(() => {
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        // we use the shortcode and verseref coming in via the cell data
        // if the user wishes to change them, that percolates back up and
        // down into us via cell data
        const module = scriptureState.catalog[data.shortcode];
        const parser = makeModuleParser(module);
        const res = parseReference(module, parser, data.verseref);

        if (res.success) {
            const scripturePromises = res.sbcs.map((sbc) => getScripture({ ...sbc, shortcode: data.shortcode }));
            Promise.all(scripturePromises).then((scriptures) => {
                setScripture(scriptures.map((s, i) => <ScriptureText key={i} data={s} />));
            });
        } else {
            setScripture([]);
        }
    }, [scriptureState.catalog, scriptureState.valid, data.shortcode, data.verseref]);

    if (!scriptureState.valid || !scriptureState.catalog) {
        return <div>Loading...</div>;
    }

    const updateVR = (data: SCVerseRef) => {
        console.log(data);
        setCell({
            ...cell.data,
            ...data,
        });
    };

    return (
        <Card>
            <CardHeader>
                <VerseRefPicker data={{ shortcode: data.shortcode, verseref: data.verseref }} setData={updateVR} />
            </CardHeader>
            <CardBody>
                <CardText>{scripture}</CardText>
            </CardBody>
        </Card>
    );
};

export default ScriptureViewer;
