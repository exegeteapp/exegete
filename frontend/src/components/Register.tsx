import React from 'react';
import { Input, Form, FormGroup, Label, Row, Button, Col, Container } from 'reactstrap';
import { RouteComponentProps, useHistory } from 'react-router';
import { IConfigContext, ConfigContext } from '../config/Config';
import useInput from '../util/useInput';
import ReCAPTCHA from "react-google-recaptcha";
import { IUserContext, UserContext, Register as RegisterD, Login as LoginD } from "../user/User";

function Register(props: RouteComponentProps) {
    const history = useHistory();
    const { state } = React.useContext<IConfigContext>(ConfigContext);
    const { dispatch } = React.useContext<IUserContext>(UserContext);
    const [captcha, setCaptcha] = React.useState('');

    const name = useInput("");
    const affiliation = useInput("");
    const email = useInput("");
    const password = useInput("");
    const password2 = useInput("");

    const submitDisabled = () => name.value.length === 0 || password.value.length === 0 || (password.value !== password2.value) || email.value.length === 0;
    const passwordError = () => {
        if ((password.value.length > 0) && (password2.value.length > 0) && (password.value !== password2.value)) {
            return "Passwords do not match";
        }
    }

    function submit(e: React.FormEvent<HTMLFormElement>) {
        const doLogin = async () => {
            await RegisterD(dispatch, {
                name: name.value,
                affiliation: affiliation.value,
                email: email.value,
                password: password.value,
                captcha: captcha
            });
            await LoginD(dispatch, email.value, password.value);
            history.push('/');
        };

        e.preventDefault()
        doLogin();
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
                        {passwordError()}
                        <FormGroup>
                            <ReCAPTCHA onChange={(token: string | null) => { setCaptcha(token || "") }} sitekey={state.config?.recaptcha_site_key || ""} />
                        </FormGroup>
                        <div className="d-grid gap-2">
                            <Button color="success" disabled={submitDisabled()}>Create New Account</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>;
}

export default Register;
