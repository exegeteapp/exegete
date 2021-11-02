import React from 'react';
import { RouteComponentProps } from 'react-router';
import { IUserContext, UserContext } from "../user/User";
import UserHome from './UserHome';
import GuestHome from './GuestHome';

function Home(props: RouteComponentProps) {
    const { state } = React.useContext<IUserContext>(UserContext);

    if (state.valid === true && state.user) {
        return <UserHome {...props}></UserHome>;
    }

    return <GuestHome {...props}></GuestHome>;
}

export default Home;
