import React, { useEffect, useState } from "react";
import { Input, Alert, Form, Row, Col } from "reactstrap";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import parseReference from "./VerseRef";
import useInput from "../util/useInput";
import { getModuleParser } from "../scripture/ParserCache";

const ShortCodeInput: React.FC<{
    value: string;
    setValue: (s: string) => void;
}> = ({ value, setValue }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);

    if (!scriptureState.valid || !scriptureState.catalog) {
        return <></>;
    }

    const options = Object.entries(scriptureState.catalog).map((c, i) => {
        return <option key={i}>{c[0]}</option>;
    });

    return (
        <Input name="select" type="select" value={value} onChange={(e) => setValue(e.currentTarget.value)}>
            {options}
        </Input>
    );
};

export interface SCVerseRef {
    shortcode: string;
    verseref: string;
}

export const VerseRefPicker: React.FC<{
    data: SCVerseRef;
    setData: (data: SCVerseRef) => void;
    small?: boolean;
}> = ({ data, setData, small }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const vr = useInput(data["verseref"]);
    const [sc, setSC] = useState(data["shortcode"]);
    const [parserError, setParserError] = React.useState("");

    const submit = (event: any) => {
        event.preventDefault();
        setData({
            shortcode: sc,
            verseref: vr.value,
        });
    };

    const failureMessage = () => {
        if (parserError) {
            return <Alert>{parserError}</Alert>;
        }
    };

    const sc_width = small ? 6 : 3;
    const in_width = small ? 6 : 9;

    useEffect(() => {
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        const module = scriptureState.catalog[sc];
        const parser = getModuleParser(module, sc);
        const res = parseReference(module, parser, vr.value);

        if (res.success) {
            setParserError("");
        } else {
            setParserError(res.error);
        }
    }, [scriptureState, sc, vr.value]);

    return (
        <>
            <Form onSubmit={submit}>
                <Row>
                    <Col sm={{ size: sc_width, offset: 0 }}>
                        <ShortCodeInput
                            value={sc}
                            setValue={(s: string) => {
                                // we immediately push this state up
                                setData({
                                    shortcode: s,
                                    verseref: vr.value,
                                });
                                // update our local state as well
                                setSC(s);
                            }}
                        />
                    </Col>
                    <Col sm={{ size: in_width, offset: 0 }}>
                        <Input autoComplete="off" id="verseref" name="verseref" placeholder="Verse reference" {...vr} />
                    </Col>
                </Row>
                {failureMessage()}
            </Form>
        </>
    );
};
