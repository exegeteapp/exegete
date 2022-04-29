import React from "react";
import axios from "axios";
import { Container, Row, Col, Input, Form, FormGroup, Label, Button, Alert } from "reactstrap";
import useInput from "../util/useInput";
import Header from "./Header";
import { Helmet } from "react-helmet-async";
import { Footer } from "./Footer";

function ForgotPassword() {
    const email = useInput("");
    const [message, setMessage] = React.useState("");

    const failureMessage = () => {
        if (message) {
            return <Alert>{message}</Alert>;
        }
    };

    const submitDisabled = () => email.value.length === 0;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        const doReset = async () => {
            try {
                await axios.post("/api/v1/auth/forgot-password", {
                    email: email.value,
                });
            } catch {
                setMessage("Failed to send reset email");
                return;
            }
            setMessage("Please check your inbox for a reset link");
        };

        e.preventDefault();
        doReset();
    }

    return (
        <>
            <Header />
            <Helmet>
                <title>Forgot Password - exegete.app</title>
            </Helmet>
            <Container id="main">
                <Row>
                    <Col sm={{ size: 6, offset: 3 }}>
                        {failureMessage()}
                        <Form inline onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label for="email" hidden>
                                    Email
                                </Label>
                                <Input id="email" name="email" placeholder="Email" type="email" {...email} />
                            </FormGroup>
                            <div className="d-grid gap-2">
                                <Button color="primary" disabled={submitDisabled()}>
                                    Reset password
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
}

export default ForgotPassword;
