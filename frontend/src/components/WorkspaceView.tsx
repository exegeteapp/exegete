import React from "react";
import { useParams } from "react-router";
import {
    Button,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledDropdown,
} from "reactstrap";
import { IUserContext, UserContext, UserLoggedIn } from "../user/User";
import { validate as uuidValidate } from "uuid";
import { WorkspaceContext, IWorkspaceContext, WorkspaceProvider } from "../workspace/Workspace";
import ScriptureViewer, { ScriptureCellData } from "./Cells/ScriptureViewer";
import Error from "./Cells/Error";
import { BaseHeader } from "./Header";
import useInput from "../util/useInput";

const InnerWorkspaceView = () => {
    const { state: workspaceState, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    if (!workspaceState.valid || !workspaceState.workspace) {
        return <p>Loading workspace...</p>;
    }

    const cells = workspaceState.workspace.workspace.cells.map((cell, index) => {
        if (cell.cell_type === "scripture-viewer") {
            const setCell = (data: ScriptureCellData) => {
                if (workspaceState.workspace) {
                    dispatch({ type: "workspace_cell_set", cell: index, data: data });
                }
            };
            return <ScriptureViewer key={index} cell={cell} setCell={setCell} />;
        }
        return <Error key={index} cell={cell} setCell={(e) => {}} />;
    });

    return <>{cells}</>;
};

const RenameWorkspaceModal: React.FC<{ show: boolean; setShow: (v: boolean) => void }> = ({ show, setShow }) => {
    const { state: workspaceState, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);
    const getTitle = () => {
        if (!workspaceState.valid || !workspaceState.workspace) {
            return "";
        }
        return workspaceState.workspace.title;
    };
    const newTitle = useInput(getTitle());

    const cancel = () => {
        setShow(false);
    };
    const save = () => {
        dispatch({ type: "workspace_set_title", title: newTitle.value });
        setShow(false);
    };

    return (
        <>
            <Modal toggle={() => setShow(!show)} isOpen={true}>
                <ModalHeader toggle={() => setShow(!show)}>Rename Workspace</ModalHeader>
                <ModalBody>
                    <Input type="text" {...newTitle}></Input>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={save}>
                        Set title
                    </Button>{" "}
                    <Button onClick={cancel}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

const WorkspaceHeader: React.FC = () => {
    const { state: workspaceState } = React.useContext<IWorkspaceContext>(WorkspaceContext);
    const [showRenameWorkspaceModal, setShowRenameWorkspaceModal] = React.useState(false);
    var title: string = "";

    if (workspaceState.valid && workspaceState.workspace) {
        title = workspaceState.workspace.title;
    }

    // there's no point having modals in the DOM all the time, and it complicates state management.
    // we pop them into existence when needed.
    const modals: JSX.Element[] = [];
    if (showRenameWorkspaceModal) {
        modals.push(<RenameWorkspaceModal show={showRenameWorkspaceModal} setShow={setShowRenameWorkspaceModal} />);
    }

    return (
        <>
            {modals}
            <BaseHeader>
                <UncontrolledDropdown inNavbar nav>
                    <DropdownToggle caret nav>
                        {title}
                    </DropdownToggle>
                    <DropdownMenu end>
                        <DropdownItem onClick={() => setShowRenameWorkspaceModal(true)}>Rename...</DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </BaseHeader>
        </>
    );
};

const WorkspaceView = () => {
    const { id } = useParams();
    const { state: userState } = React.useContext<IUserContext>(UserContext);

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
                <WorkspaceHeader />
                <Container id="main">
                    <InnerWorkspaceView />
                </Container>
            </WorkspaceProvider>
        </>
    );
};

export default WorkspaceView;
