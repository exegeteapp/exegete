import React from "react";
import { useParams } from "react-router";
import { Container } from "reactstrap";
import { validate as uuidValidate } from "uuid";
import { useAppSelector } from "../../../exegete/hooks";
import { selectUser, UserLoggedIn } from "../../../user/User";
import { Footer } from "../../Footer";
import { WorkspaceProvider } from "../../Workspace";
import { WorkspaceHeader } from "./Header";
import { InnerWorkspaceView } from "./InnerWorkspaceWrapper";

const Workspace: React.FC = () => {
    const { id } = useParams();
    const refs = React.useRef<(HTMLDivElement | null)[]>([]);
    const userState = useAppSelector(selectUser);

    const local = !UserLoggedIn(userState);

    if (!id || !uuidValidate(id)) {
        return <p>Invalid workspace ID</p>;
    }

    // important: we don't initiate WorkspaceProvider until we have valid user state,
    // as that determines whether we write data into local storage or use the backend API
    if (!userState.valid) {
        return <></>;
    }

    return (
        <>
            <WorkspaceProvider id={id} local={local}>
                <WorkspaceHeader refs={refs} />
                <Container id="main" fluid="lg">
                    <InnerWorkspaceView refs={refs} />
                </Container>
            </WorkspaceProvider>
            <Footer />
        </>
    );
};

export default Workspace;
