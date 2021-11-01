import React from 'react';
import { Input, Form, FormGroup, Label, Row, Button, Col, Container } from 'reactstrap';
import { RouteComponentProps } from 'react-router';
import { IConfigContext, ConfigContext } from '../config/Config';
import useInput from '../util/useInput';
import ReCAPTCHA from "react-google-recaptcha";

function Register(props: RouteComponentProps) {
    const { state } = React.useContext<IConfigContext>(ConfigContext);
    const [ captcha, setCaptcha ] = React.useState('');

    const name = useInput("");
    const affiliation = useInput("");
    const email = useInput("");
    const password = useInput("");
    const password2 = useInput("");

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        console.log(captcha);
    }

    return <>
        <Container id="main">
            <Row>
                <Col sm={{ size: 6, offset: 3 }}>
                    <h1 className="display-3">Sign up</h1>
                    <Form inline onSubmit={submit}>
                        <FormGroup>
                            <Label
                                for="name"
                                hidden
                            >
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Name"
                                {...name}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label
                                for="affiliation"
                                hidden
                            >
                                Institutional affiliation
                            </Label>
                            <Input
                                id="affliation"
                                name="affliation"
                                placeholder="Institutional affiliation"
                                {...affiliation}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label
                                for="email"
                                hidden
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                placeholder="Email"
                                type="email"
                                {...email}
                            />
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <Label
                                for="password"
                                hidden
                            >
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                placeholder="Password"
                                type="password"
                                {...password}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label
                                for="password2"
                                hidden
                            >
                                Password (verify)
                            </Label>
                            <Input
                                id="password2"
                                name="password2"
                                placeholder="Repeat password"
                                type="password"
                                {...password2}
                            />
                        </FormGroup>
                        <FormGroup>
                           <ReCAPTCHA onChange={(token: string|null) => {setCaptcha(token||"")}} sitekey={state.config?.recaptcha_site_key || ""} />
                        </FormGroup>
                        <div className="d-grid gap-2">
                            <Button color="success">Create New Account</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>;
}

export default Register;
