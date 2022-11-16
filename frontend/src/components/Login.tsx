import React from "react";
import { Input, Form, FormGroup, Label, Button, Alert } from "reactstrap";
import useInput from "../util/useInput";
import { Login as DLogin, selectUser } from "../user/User";
import { useAppDispatch, useAppSelector } from "../exegete/hooks";

function Login() {
    const email = useInput("");
    const password = useInput("");
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectUser);

    const failureMessage = () => {
        if (state.login_error) {
            return <Alert color="danger">Login failed: {state.login_error}</Alert>;
        }
    };

    const submitDisabled = () => email.value.length === 0 || password.value.length === 0;
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        dispatch(DLogin([email.value, password.value]));
    }

    return (
        <div>
            {failureMessage()}
            <Form onSubmit={handleSubmit}>
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
                    <Input id="password" name="password" placeholder="Password" type="password" {...password} />
                </FormGroup>
                <div className="d-grid gap-2">
                    <Button color="primary" disabled={submitDisabled()}>
                        Log in
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Login;
