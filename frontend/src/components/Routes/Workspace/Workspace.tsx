import React from "react";
import { useParams } from "react-router";
import { Container } from "reactstrap";
import { validate as uuidValidate } from "uuid";
import { useAppDispatch, useAppSelector } from "../../../exegete/hooks";
import { toolbarHide } from "../../../exegete/toolbar";
import { selectUser, UserLoggedIn } from "../../../user/User";
import { Footer } from "../../Footer";
import { IntertextureToolbar } from "../../IntertextureToolbar/IntertextureToolbar";
import { WorkspaceProvider } from "../../Workspace";
import { WorkspaceHeader } from "./Header";
import { InnerWorkspaceView } from "./InnerWorkspaceWrapper";

const Workspace: React.FC = () => {
    const { id } = useParams();
    const refs = React.useRef<(HTMLDivElement | null)[]>([]);
    const userState = useAppSelector(selectUser);
    const dispatch = useAppDispatch();

    const local = !UserLoggedIn(userState);

    if (!id || !uuidValidate(id)) {
        return <p>Invalid workspace ID</p>;
    }

    // click off: clear any toolbar state
    const handleClick = () => {
        dispatch(toolbarHide());
    };

    // important: we don't initiate WorkspaceProvider until we have valid user state,
    // as that determines whether we write data into local storage or use the backend API
    if (!userState.valid) {
        return <></>;
    }

    return (
        <div onClick={handleClick}>
            <WorkspaceProvider id={id} local={local}>
                <IntertextureToolbar />
                <WorkspaceHeader refs={refs} />
                <Container id="main" fluid="lg">
                    <InnerWorkspaceView refs={refs} />
                </Container>
            </WorkspaceProvider>
            <Footer />
        </div>
    );
};

export default Workspace;
