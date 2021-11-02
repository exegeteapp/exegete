import React from 'react';
import { Input, Form, FormGroup, Label, Button } from 'reactstrap';
import useInput from '../util/useInput';
import { IUserContext, UserContext, Login as DLogin } from "../user/User";

function Login() {
    const email = useInput("");
    const password = useInput("");
    const { dispatch } = React.useContext<IUserContext>(UserContext);

    const submitDisabled = () => email.value.length === 0 || password.value.length === 0;
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        const doLogin = async () => {
            await DLogin(dispatch, email.value, password.value);
        };

        e.preventDefault()
        doLogin();
    }


    return <Form inline onSubmit={handleSubmit}>
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
        <div className="d-grid gap-2">
            <Button color="primary" disabled={submitDisabled()}>Log in</Button>
        </div>
    </Form>
}

export default Login;
