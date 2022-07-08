import { selectUser, UserLoggedIn } from "../user/User";
import UserHome from "./UserHome";
import GuestHome from "./GuestHome";
import Header from "./Header";
import { Footer } from "./Footer";
import { useAppSelector } from "../exegete/hooks";

function Home() {
    const state = useAppSelector(selectUser);

    if (UserLoggedIn(state)) {
        return (
            <>
                <Header />
                <UserHome></UserHome>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <GuestHome></GuestHome>;
            <Footer />
        </>
    );
}

export default Home;
