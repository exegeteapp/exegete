import React from 'react';
import { Container } from 'reactstrap';
import { RouteComponentProps } from 'react-router';
import { IUserContext, UserContext, Logout } from "../user/User";

function UserHome(props: RouteComponentProps) {
    const { dispatch } = React.useContext<IUserContext>(UserContext);

    const handleLogout = () => {
        const doLogout = async () => {
            await Logout(dispatch);
        };
        doLogout();
    };

    return <>
        <Container id="main">
            <h1 className="display-3">Welcome!</h1>
            <p>
                You are logged in. (<span onClick={handleLogout}>Logout</span>)
            </p>
        </Container>
    </>;
}

export default UserHome;
