import React from 'react';
import { useParams } from 'react-router';
import { Container } from 'reactstrap';
import { IUserContext, UserContext, UserLoggedIn } from "../user/User";
import { validate as uuidValidate } from 'uuid';
import { Button } from 'reactstrap';
import { WorkspaceContext, IWorkspaceContext, WorkspaceProvider } from '../workspace/Workspace';

const InnerWorkspaceView = () => {
    const { state: workspaceState, save: saveWorkspace } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    const save = async () => {
        saveWorkspace();
    };

    if (!workspaceState.valid || !workspaceState.workspace) {
        return <p>Loading workspace...</p>;
    }

    // const workspace = workspaceState.workspace;
    // const componets: React.Component[] = [];

    return <>
        <p>hello: workspace {workspaceState.id} is ready to rumble.</p>
        <Button onClick={save}>Save</Button>
    </>
};

const WorkspaceView = () => {
    const { id } = useParams();
    const { state: userState } = React.useContext<IUserContext>(UserContext);

    const local = !UserLoggedIn(userState);

    if (!id || !uuidValidate(id)) {
        return <></>;
    }

    return <Container id="main">
        <WorkspaceProvider id={id} local={local}>
            <InnerWorkspaceView/>
        </WorkspaceProvider>
    </Container>
};

export default WorkspaceView;