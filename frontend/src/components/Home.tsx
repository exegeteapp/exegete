import React from 'react';
import { IUserContext, UserContext, UserLoggedIn } from "../user/User";
import UserHome from './UserHome';
import GuestHome from './GuestHome';

function Home() {
    const { state } = React.useContext<IUserContext>(UserContext);

    if (UserLoggedIn(state)) {
        return <UserHome></UserHome>;
    }

    return <GuestHome></GuestHome>;
}

export default Home;
