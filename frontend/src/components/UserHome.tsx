import React from "react";
import { Container } from "reactstrap";
import { WorkspaceMetadata } from "../workspace/Types";
import { getWorkspaces } from "../workspace/Get";
import NewWorkspaceButton from "./NewWorkspaceButton";
import WorkspaceList from "./WorkspaceList";
import { useAppSelector } from "../exegete/hooks";
import { selectUser } from "../user/User";

function UserHome() {
    const [workspaces, setWorkspaces] = React.useState<WorkspaceMetadata[]>([]);
    const state = useAppSelector(selectUser);

    React.useEffect(
        () => {
            async function get() {
                const w = await getWorkspaces();
                w.sort((a, b) => (b.updated || b.created).getTime() - (a.updated || a.created).getTime());
                setWorkspaces(w);
            }
            get();
        },
        [] // only run once
    );

    return (
        <>
            <Container id="main">
                <h1 className="display-5">Welcome, {state.user?.name}.</h1>
                <NewWorkspaceButton local={false} color="success">
                    Create new workspace
                </NewWorkspaceButton>
                <WorkspaceList workspaces={workspaces} />
            </Container>
        </>
    );
}

export default UserHome;
