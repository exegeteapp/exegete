import React from "react";
import { Container } from "reactstrap";
import { WorkspaceMetadata } from "../workspace/Workspace";
import { getWorkspaces } from "../workspace/Get";
import NewWorkspaceButton from "./NewWorkspaceButton";
import WorkspaceList from "./WorkspaceList";

function UserHome() {
    const [workspaces, setWorkspaces] = React.useState<WorkspaceMetadata[]>([]);

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
                <h1 className="display-4">Welcome back.</h1>
                <NewWorkspaceButton local={false} color="success">
                    Create new workspace
                </NewWorkspaceButton>
                <WorkspaceList workspaces={workspaces} />
            </Container>
        </>
    );
}

export default UserHome;
