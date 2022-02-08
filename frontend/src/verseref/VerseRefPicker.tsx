import React, { useEffect, useState } from "react";
import { Input, Alert, Form, Row, Col } from "reactstrap";
import { IScriptureContext, ScriptureContext } from "../scripture/Scripture";
import parseReference, { makeModuleParser } from "./VerseRef";
import useInput from "../util/useInput";

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
}> = ({ data, setData }) => {
    const { state: scriptureState } = React.useContext<IScriptureContext>(ScriptureContext);
    const vr = useInput(data["verseref"]);
    const [sc, setSC] = useState(data["shortcode"]);
    const [parserError, setParserError] = React.useState("");

    // we only push the internal state of the component out when the form is submitted
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
    useEffect(() => {
        if (!scriptureState.valid || !scriptureState.catalog) {
            return;
        }

        const module = scriptureState.catalog[sc];
        const parser = makeModuleParser(module);
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
                    <Col sm={{ size: 3, offset: 0 }}>
                        <ShortCodeInput value={sc} setValue={setSC} />
                    </Col>
                    <Col sm={{ size: 9, offset: 0 }}>
                        <Input id="verseref" name="verseref" placeholder="Verse reference" {...vr} />
                    </Col>
                </Row>
                {failureMessage()}
            </Form>
        </>
    );
};
