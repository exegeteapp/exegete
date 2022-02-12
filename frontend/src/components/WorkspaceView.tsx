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
import { v4 as uuidv4 } from "uuid";
import { IUserContext, UserContext, UserLoggedIn } from "../user/User";
import { validate as uuidValidate } from "uuid";
import { WorkspaceContext, IWorkspaceContext, WorkspaceProvider } from "../workspace/Workspace";
import Error from "./Cells/Error";
import { BaseHeader } from "./Header";
import useInput from "../util/useInput";
import Registry from "../workspace/CellRegistry";

const InnerWorkspaceView = () => {
    const { state: workspaceState, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    if (!workspaceState.valid || !workspaceState.workspace) {
        return <p>Loading workspace...</p>;
    }

    const cells = workspaceState.workspace.data.cells.map((cell) => {
        const functions = {
            set: (data: any) => {
                dispatch({ type: "workspace_cell_set", uuid: cell.uuid, data: data });
            },
            delete: () => {
                dispatch({ type: "workspace_cell_delete", uuid: cell.uuid });
            },
            moveUp: () => {
                dispatch({ type: "workspace_cell_move_up", uuid: cell.uuid });
            },
            moveDown: () => {
                dispatch({ type: "workspace_cell_move_down", uuid: cell.uuid });
            },
        };

        for (var key in Registry) {
            if (key === cell.cell_type) {
                return React.createElement(Registry[key].component, {
                    key: cell.uuid,
                    cell: cell,
                    functions: functions,
                });
            }
        }

        return <Error key={cell.uuid} cell={cell} functions={functions} />;
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

const AddComponentMenu: React.FC = () => {
    const { state, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    const items = Object.keys(Registry).map((key) => {
        const defn = Registry[key];
        const newCell = () => {
            dispatch({
                type: "workspace_cell_add",
                cell: {
                    cell_type: key,
                    uuid: uuidv4(),
                    data: defn.newData(state.workspace!.data),
                },
            });
        };
        return (
            <DropdownItem key={key} onClick={newCell}>
                {defn.title}
            </DropdownItem>
        );
    });

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                Add
            </DropdownToggle>
            <DropdownMenu>{items}</DropdownMenu>
        </UncontrolledDropdown>
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
                <UncontrolledDropdown nav>
                    <DropdownToggle caret nav>
                        Workspace: {title}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => setShowRenameWorkspaceModal(true)}>Rename</DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
                <AddComponentMenu />
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
                <Container id="main" fluid="md">
                    <InnerWorkspaceView />
                </Container>
            </WorkspaceProvider>
        </>
    );
};

export default WorkspaceView;
