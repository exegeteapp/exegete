import React from "react";
import { Alert, Input, Form, FormGroup, Label, Row, Button, Col, Container } from "reactstrap";
import { useNavigate } from "react-router";
import { IConfigContext, ConfigContext } from "../config/Config";
import useInput from "../util/useInput";
import ReCAPTCHA from "react-google-recaptcha";
import { IUserContext, UserContext, Register as RegisterD, Login as LoginD } from "../user/User";
import Header from "./Header";

function Register() {
    const navigate = useNavigate();
    const { state: configState } = React.useContext<IConfigContext>(ConfigContext);
    const { state: userState, dispatch: userDispatch } = React.useContext<IUserContext>(UserContext);
    const [captcha, setCaptcha] = React.useState("");

    // hack: this page isn't useful if we're already registered.
    // as a side-effect, this redirects away from the form on success
    if (userState.user) {
        navigate("/");
    }

    const failureMessage = () => {
        if (userState.registration_error) {
            return <Alert color="danger">Account registration failed: {userState.registration_error}</Alert>;
        }
    };

    const name = useInput("");
    const affiliation = useInput("");
    const email = useInput("");
    const password = useInput("");
    const password2 = useInput("");

    const submitDisabled = () =>
        password.value.length === 0 ||
        password2.value.length === 0 ||
        password.value.length < 8 ||
        password.value !== password2.value;
    const passwordError = () => {
        if (password.value.length > 0 && password2.value.length > 0 && password.value !== password2.value) {
            return "Passwords do not match";
        }
        if (password.value.length < 8) {
            return "Password is too short";
        }
    };

    function submit(e: React.FormEvent<HTMLFormElement>) {
        const doLogin = async () => {
            await RegisterD(userDispatch, {
                name: name.value,
                affiliation: affiliation.value,
                email: email.value,
                password: password.value,
                captcha: captcha,
            });
            await LoginD(userDispatch, email.value, password.value);
        };

        e.preventDefault();
        doLogin();
    }

    return (
        <>
            <Header />
            <Container id="main">
                <Row>
                    <Col sm={{ size: 6, offset: 3 }}>
                        <h1 className="display-3">Sign up</h1>
                        {failureMessage()}
                        <Form inline onSubmit={submit}>
                            <FormGroup>
                                <Label for="name" hidden>
                                    Name
                                </Label>
                                <Input id="name" name="name" placeholder="Name" {...name} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="affiliation" hidden>
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
                                <Label for="email" hidden>
                                    Email
                                </Label>
                                <Input id="email" name="email" placeholder="Email" type="email" {...email} />
                            </FormGroup>{" "}
                            <FormGroup>
                                <Label for="password" hidden>
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
                                <Label for="password2" hidden>
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
                                <ReCAPTCHA
                                    onChange={(token: string | null) => {
                                        setCaptcha(token || "");
                                    }}
                                    sitekey={configState.config?.recaptcha_site_key || ""}
                                />
                            </FormGroup>
                            <div className="d-grid gap-2">
                                <Button color="success" disabled={submitDisabled()}>
                                    Create New Account
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Register;
