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
import {
    WorkspaceContext,
    IWorkspaceContext,
    WorkspaceProvider,
    deleteWorkspace,
    TextSize,
    DirtyState,
} from "../workspace/Workspace";
import Error from "./Cells/Error";
import { BaseHeader } from "./Header";
import useInput from "../util/useInput";
import Registry from "../workspace/CellRegistry";
import { makeNewCell } from "../workspace/Cell";
import { Helmet } from "react-helmet-async";
import { Footer } from "./Footer";
import { WorkspaceRedo, WorkspaceUndo } from "../workspace/History";

type RefsFC = React.FC<React.PropsWithChildren<{ refs: React.MutableRefObject<(HTMLDivElement | null)[]> }>>;

const ScrollWrapper = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
    return <div ref={ref}>{props.children}</div>;
});

const InnerWorkspaceView: RefsFC = ({ refs }) => {
    const { state: workspaceState } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    if (!workspaceState.valid || !workspaceState.workspace) {
        return <p>Loading workspace...</p>;
    }

    const cells = workspaceState.workspace.data.cells.map((cell, index) => {
        const inner = () => {
            for (var key in Registry) {
                if (key === cell.cell_type) {
                    return React.createElement(Registry[key].component, {
                        key: cell.uuid,
                        cell: cell,
                    });
                }
            }

            return <Error key={cell.uuid} cell={cell} />;
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

const RenameWorkspaceModal: React.FC<React.PropsWithChildren<{ show: boolean; setShow: (v: boolean) => void }>> = ({
    show,
    setShow,
}) => {
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

const DeleteWorkspaceModal: React.FC<React.PropsWithChildren<{ show: boolean; setShow: (v: boolean) => void }>> = ({
    show,
    setShow,
}) => {
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
                <ModalBody>Do you really want to delete this workspace? This cannot be undone.</ModalBody>
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

const WorkspaceMenu: React.FC<
    React.PropsWithChildren<{
        title: string;
        setShowRenameWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
        setShowDeleteWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
    }>
> = ({ title, setShowRenameWorkspaceModal, setShowDeleteWorkspaceModal }) => {
    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                Workspace: {title}
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem onClick={() => setShowRenameWorkspaceModal(true)}>Rename</DropdownItem>
                <DropdownItem onClick={() => setShowDeleteWorkspaceModal(true)}>Delete</DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
};

const EditMenu: React.FC<React.PropsWithChildren<unknown>> = () => {
    const { state, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    if (!state.valid || !state.workspace) {
        return <></>;
    }
    const undo = () => {
        if (!state.workspace) {
            return;
        }
        WorkspaceUndo(dispatch, state.workspace.data);
    };
    const redo = () => {
        if (!state.workspace) {
            return;
        }
        WorkspaceRedo(dispatch, state.workspace.data);
    };

    const cannotUndo = () => {
        return (
            !state.can_apply_history ||
            state.dirty !== DirtyState.CLEAN ||
            !state.workspace ||
            state.workspace.data.history.undo.length === 0
        );
    };

    const cannotRedo = () => {
        return (
            !state.can_apply_history ||
            state.dirty !== DirtyState.CLEAN ||
            !state.workspace ||
            state.workspace.data.history.redo.length === 0
        );
    };

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                Edit
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem disabled={cannotUndo()} onClick={() => undo()}>
                    Undo
                </DropdownItem>
                <DropdownItem disabled={cannotRedo()} onClick={() => redo()}>
                    Redo
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
};
const ViewMenu: React.FC<React.PropsWithChildren<unknown>> = () => {
    const { state, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    const canZoom = (offset: number) => {
        if (!state.valid || !state.workspace) {
            return;
        }
        const levels = Object.values(TextSize);
        const toLevel = levels.indexOf(state.workspace.data.global.view.textSize) + offset;
        if (toLevel < 0 || toLevel >= levels.length) {
            return false;
        }
        return true;
    };

    const zoom = (offset: number) => {
        if (!state.valid || !state.workspace) {
            return;
        }

        const levels = Object.values(TextSize);
        const currentLevel = state.workspace.data.global.view.textSize;
        const currentIndex = levels.indexOf(currentLevel);
        if (currentIndex === -1) {
            return;
        }
        const targetIndex = currentIndex + offset;

        if (targetIndex >= 0 && targetIndex < levels.length) {
            const newLevel = levels[targetIndex];
            dispatch({ type: "workspace_set_text_size", text_size: newLevel });
        }
    };

    const reset = () => {
        if (!state.valid || !state.workspace) {
            return;
        }
        dispatch({ type: "workspace_set_text_size", text_size: TextSize.MEDIUM });
    };

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                View
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem disabled={!canZoom(1)} onClick={() => zoom(1)}>
                    Zoom In
                </DropdownItem>
                <DropdownItem disabled={!canZoom(-1)} onClick={() => zoom(-1)}>
                    Zoom Out
                </DropdownItem>
                <DropdownItem onClick={() => reset()}>Reset</DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
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
                <WorkspaceMenu
                    title={title}
                    setShowDeleteWorkspaceModal={setShowDeleteWorkspaceModal}
                    setShowRenameWorkspaceModal={setShowRenameWorkspaceModal}
                />
                <EditMenu />
                <ViewMenu />
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
