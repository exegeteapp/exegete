import React from 'react';
import { Container } from 'reactstrap';
import { RouteComponentProps } from 'react-router';
import { IUserContext, UserContext, Logout } from "../user/User";

function UserHome(props: RouteComponentProps) {
    const { dispatch } = React.useContext<IUserContext>(UserContext);

    return <>
        <Container id="main">
            <h1 className="display-4">Welcome back.</h1>
            <p>
                List of documents to come here....
            </p>
        </Container>
    </>;
}

export default UserHome;
