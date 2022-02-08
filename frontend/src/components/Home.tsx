import React from "react";
import { IUserContext, UserContext, UserLoggedIn } from "../user/User";
import UserHome from "./UserHome";
import GuestHome from "./GuestHome";
import Header from "./Header";

function Home() {
    const { state } = React.useContext<IUserContext>(UserContext);

    if (UserLoggedIn(state)) {
        return (
            <>
                <Header />
                <UserHome></UserHome>
            </>
        );
    }

    return (
        <>
            <Header />
            <GuestHome></GuestHome>;
        </>
    );
}

export default Home;
