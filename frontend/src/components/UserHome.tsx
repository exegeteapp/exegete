import React from 'react';
import { Container } from 'reactstrap';
import { RouteComponentProps } from 'react-router';

function UserHome(props: RouteComponentProps) {

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
