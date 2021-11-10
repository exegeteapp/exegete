import React from 'react';
import { IUserContext, UserContext } from "../user/User";
import UserHome from './UserHome';
import GuestHome from './GuestHome';

function Home() {
    const { state } = React.useContext<IUserContext>(UserContext);

    if (state.valid === true && state.user) {
        return <UserHome></UserHome>;
    }

    return <GuestHome></GuestHome>;
}

export default Home;
