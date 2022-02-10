import { CellFC } from "../../workspace/Workspace";
import React, { useEffect } from "react";
import { Card, CardBody, CardText, CardHeader } from "reactstrap";
import parseReference from "../../verseref/VerseRef";
import { IScriptureContext, ScriptureContext } from "../../scripture/Scripture";
import { getScripture } from "../../scripture/ScriptureAPI";
import { SCVerseRef, VerseRefPicker } from "../../verseref/VerseRefPicker";
import { ScriptureText } from "../../scripture/ScriptureText";
import { getModuleParser } from "../../scripture/ParserCache";

export interface ScriptureCellData {
    shortcode: string;
    verseref: string;
}

export const ScriptureViewer: CellFC<ScriptureCellData> = ({ cell, setCell }) => {
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
                    setScripture(
                        scriptures.map((s, i) => (
                            <ScriptureText module={module} book={res.sbcs[i].book} key={i} data={s} />
                        ))
                    );
                }
            });
        } else {
            setScripture([]);
        }

        return () => {
            isSubscribed = false;
        };
    }, [scriptureState.catalog, scriptureState.valid, data.shortcode, data.verseref]);

    if (!scriptureState.valid || !scriptureState.catalog) {
        return <div>Loading...</div>;
    }

    const updateVR = (data: SCVerseRef) => {
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
                <CardText tag="div">{scripture}</CardText>
            </CardBody>
        </Card>
    );
};

export default ScriptureViewer;
