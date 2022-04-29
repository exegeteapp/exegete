import React from "react";
import { useNavigate, useParams } from "react-router";
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
import { WorkspaceContext, IWorkspaceContext, WorkspaceProvider, deleteWorkspace } from "../workspace/Workspace";
import Error from "./Cells/Error";
import { BaseHeader } from "./Header";
import useInput from "../util/useInput";
import Registry from "../workspace/CellRegistry";
import { makeNewCell } from "../workspace/Cell";
import { Helmet } from "react-helmet-async";
import { Footer } from "./Footer";

type RefsFC = React.FC<{ refs: React.MutableRefObject<(HTMLDivElement | null)[]> }>;

const ScrollWrapper = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
    return <div ref={ref}>{props.children}</div>;
});

const InnerWorkspaceView: RefsFC = ({ refs }) => {
    const { state: workspaceState, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    if (!workspaceState.valid || !workspaceState.workspace) {
        return <p>Loading workspace...</p>;
    }

    const cells = workspaceState.workspace.data.cells.map((cell, index) => {
        const functions = {
            set: (data: any) => {
                dispatch({ type: "workspace_cell_set", uuid: cell.uuid, data: data });
            },
            delete: () => {
                dispatch({ type: "workspace_cell_delete", uuid: cell.uuid });
            },
            moveUp: () => {
                dispatch({ type: "workspace_cell_move", uuid: cell.uuid, offset: -1 });
            },
            moveDown: () => {
                dispatch({ type: "workspace_cell_move", uuid: cell.uuid, offset: 1 });
            },
        };

        const inner = () => {
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
        };

        return (
            <ScrollWrapper key={cell.uuid} ref={(el) => (refs.current[index] = el)}>
                {inner()}
            </ScrollWrapper>
        );
    });

    return (
        <>
            <Helmet>
                <title>
                    {workspaceState && workspaceState.workspace ? workspaceState.workspace.title : ""} – exegete.app
                </title>
            </Helmet>
            {cells}
        </>
    );
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

const DeleteWorkspaceModal: React.FC<{ show: boolean; setShow: (v: boolean) => void }> = ({ show, setShow }) => {
    const { state: workspaceState, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);
    const navigate = useNavigate();

    const cancel = () => {
        setShow(false);
    };

    const apply = () => {
        deleteWorkspace(workspaceState.id, workspaceState.local);
        dispatch({ type: "workspace_deleted" });
        setShow(false);
        navigate(`/`);
    };

    return (
        <>
            <Modal toggle={() => setShow(!show)} isOpen={true}>
                <ModalHeader toggle={() => setShow(!show)}>Delete Workspace?</ModalHeader>
                <ModalBody>Do you really want to delete this workspace?</ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={apply}>
                        Delete
                    </Button>
                    <Button onClick={cancel}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

const ToolsMenu: RefsFC = ({ refs }) => {
    const { state, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);
    const cells = state.workspace ? state.workspace.data.cells : [];
    const [newlyAdded, setNewlyAdded] = React.useState(false);

    const items: JSX.Element[] = [];

    for (const key in Registry) {
        const defn = Registry[key];
        for (let i = 0; i < defn.launchers.length; i++) {
            const launcher = defn.launchers[i];
            const newCell = () => {
                dispatch({
                    type: "workspace_cell_add",
                    cell: makeNewCell(state.workspace!.data, key, defn, launcher),
                });
                setNewlyAdded(true);
            };
            items.push(
                <DropdownItem key={`${key}.${i}`} onClick={newCell}>
                    Add {launcher.title}
                </DropdownItem>
            );
        }
    }

    const calcTargetY = (ref: HTMLDivElement) => {
        return ref.getBoundingClientRect().top + window.pageYOffset - 60; // bootstrap top menu
    };

    const scrollTo = (index: number) => {
        if (refs) {
            const ref = refs.current[index];
            if (ref) {
                window.scrollTo({ top: calcTargetY(ref), behavior: "smooth" });
            }
        }
    };

    React.useEffect(() => {
        if (newlyAdded) {
            for (let j = refs.current.length - 1; j >= 0; j--) {
                const ref = refs.current[j];
                if (ref) {
                    window.scrollTo({ top: calcTargetY(ref), behavior: "smooth" });
                    setNewlyAdded(false);
                    return;
                }
            }
        }
    }, [refs, newlyAdded]);

    const jumpItems = cells.map((cell, index) => {
        for (var key in Registry) {
            const entry = Registry[key];
            if (key === cell.cell_type) {
                return (
                    <DropdownItem key={`jmp${index}`} onClick={() => scrollTo(index)}>
                        Go to #{index} [{entry.describe(cell.data)}]
                    </DropdownItem>
                );
            }
        }
        return <></>;
    });

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                Tools
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                {items}
                {jumpItems.length > 0 ? <DropdownItem key="divider" divider /> : <></>}
                {jumpItems}
            </DropdownMenu>
        </UncontrolledDropdown>
    );
};

const WorkspaceHeader: RefsFC = ({ refs }) => {
    const { state: workspaceState } = React.useContext<IWorkspaceContext>(WorkspaceContext);
    const [showRenameWorkspaceModal, setShowRenameWorkspaceModal] = React.useState(false);
    const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] = React.useState(false);
    var title: string = "";

    if (workspaceState.valid && workspaceState.workspace) {
        title = workspaceState.workspace.title;
    }

    // there's no point having modals in the DOM all the time, and it complicates state management.
    // we pop them into existence when needed.
    const modals: JSX.Element[] = [];
    if (showRenameWorkspaceModal) {
        modals.push(
            <RenameWorkspaceModal
                key={modals.length + 1}
                show={showRenameWorkspaceModal}
                setShow={setShowRenameWorkspaceModal}
            />
        );
    }
    if (showDeleteWorkspaceModal) {
        modals.push(
            <DeleteWorkspaceModal
                key={modals.length + 1}
                show={showDeleteWorkspaceModal}
                setShow={setShowDeleteWorkspaceModal}
            />
        );
    }

    return (
        <>
            {modals}
            <BaseHeader>
                <UncontrolledDropdown nav>
                    <DropdownToggle caret nav>
                        Workspace: {title}
                    </DropdownToggle>
                    <DropdownMenu md-end={"true"} color="dark" dark>
                        <DropdownItem onClick={() => setShowRenameWorkspaceModal(true)}>Rename</DropdownItem>
                        <DropdownItem onClick={() => setShowDeleteWorkspaceModal(true)}>Delete</DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
                <ToolsMenu refs={refs} />
            </BaseHeader>
        </>
    );
};

const WorkspaceView = () => {
    const { id } = useParams();
    const { state: userState } = React.useContext<IUserContext>(UserContext);
    const refs = React.useRef<(HTMLDivElement | null)[]>([]);

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

export default WorkspaceView;
