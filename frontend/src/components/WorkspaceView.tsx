import React from "react";
import { useParams } from "react-router";
import { Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { IUserContext, UserContext, UserLoggedIn } from "../user/User";
import { validate as uuidValidate } from "uuid";
import { WorkspaceContext, IWorkspaceContext, WorkspaceProvider } from "../workspace/Workspace";
import ScriptureViewer, { ScriptureCellData } from "./Cells/ScriptureViewer";
import Error from "./Cells/Error";
import { BaseHeader } from "./Header";

const InnerWorkspaceView = () => {
    const { state: workspaceState, dispatch, save } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    if (!workspaceState.valid || !workspaceState.workspace) {
        return <p>Loading workspace...</p>;
    }

    const cells = workspaceState.workspace.workspace.cells.map((cell, index) => {
        if (cell.cell_type === "scripture-viewer") {
            const setCell = (data: ScriptureCellData) => {
                if (workspaceState.workspace) {
                    dispatch({ type: "workspace_cell_set", cell: index, data: data });
                    save();
                }
            };
            return <ScriptureViewer key={index} cell={cell} setCell={setCell} />;
        }
        return <Error key={index} cell={cell} setCell={(e) => {}} />;
    });

    return <>{cells}</>;
};

const WorkspaceHeader: React.FC = () => {
    const { state: workspaceState } = React.useContext<IWorkspaceContext>(WorkspaceContext);
    var title: string = "";

    if (workspaceState.valid && workspaceState.workspace) {
        title = workspaceState.workspace.title;
    }

    return (
        <BaseHeader>
            <UncontrolledDropdown inNavbar nav>
                <DropdownToggle caret nav>
                    {title}
                </DropdownToggle>
                <DropdownMenu end>
                    <DropdownItem>Rename...</DropdownItem>
                </DropdownMenu>
            </UncontrolledDropdown>
        </BaseHeader>
    );
};

const WorkspaceView = () => {
    const { id } = useParams();
    const { state: userState } = React.useContext<IUserContext>(UserContext);

    const local = !UserLoggedIn(userState);

    if (!id || !uuidValidate(id)) {
        return <></>;
    }

    return (
        <>
            <WorkspaceProvider id={id} local={local}>
                <WorkspaceHeader />
                <Container id="main">
                    <InnerWorkspaceView />
                </Container>
            </WorkspaceProvider>
        </>
    );
};

export default WorkspaceView;
