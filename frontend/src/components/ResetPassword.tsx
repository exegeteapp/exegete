import React from "react";
import axios from "axios";
import { Container, Row, Col, Input, Form, FormGroup, Label, Button, Alert } from "reactstrap";
import useInput from "../util/useInput";
import { useParams } from "react-router";
import Header from "./Header";

function ResetPassword() {
    const params = useParams();
    const token = params.token;
    const password = useInput("");
    const password2 = useInput("");
    const [message, setMessage] = React.useState("");

    const failureMessage = () => {
        if (message) {
            return <Alert>{message}</Alert>;
        }
    };

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

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        const doReset = async () => {
            try {
                await axios.post("/api/v1/auth/reset-password", {
                    password: password.value,
                    token: token,
                });
            } catch {
                setMessage("Failed to send reset email");
                return;
            }
            setMessage("Your password has been reset.");
        };

        e.preventDefault();
        doReset();
    }

    return (
        <>
            <Header />
            <Container id="main">
                <Row>
                    <Col sm={{ size: 6, offset: 3 }}>
                        {failureMessage()}
                        <Form inline onSubmit={handleSubmit}>
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
                            <div className="d-grid gap-2">
                                <Button color="primary" disabled={submitDisabled()}>
                                    Reset password
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default ResetPassword;
