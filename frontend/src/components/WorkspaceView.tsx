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
import { selectUser, UserLoggedIn } from "../user/User";
import { validate as uuidValidate } from "uuid";
import {
    TextSize,
    DirtyState,
    selectWorkspace,
    workspaceDeleted,
    workspaceSetTitle,
    workspaceSetTextSize,
    workspaceCellAdd,
    selectWorkspaceCellListing,
    selectWorkspaceTitle,
    workspaceUndo,
    workspaceRedo,
} from "../workspace/Workspace";
import Error from "./Cells/Error";
import { BaseHeader } from "./Header";
import useInput from "../util/useInput";
import Registry from "../workspace/CellRegistry";
import { makeNewCell } from "../workspace/Cell";
import { Helmet } from "react-helmet-async";
import { Footer } from "./Footer";
import { useAppDispatch, useAppSelector } from "../exegete/hooks";
import { deleteWorkspace, WorkspaceProvider } from "../workspace/WorkspaceProvider";

type RefsFC = React.FC<React.PropsWithChildren<{ refs: React.MutableRefObject<(HTMLDivElement | null)[]> }>>;

const ScrollWrapper = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => {
    return <div ref={ref}>{props.children}</div>;
});

const CellView: RefsFC = ({ refs }) => {
    const cell_listing = useAppSelector(selectWorkspaceCellListing);

    if (!cell_listing) {
        return <></>;
    }

    const cells = cell_listing.map((cell, index) => {
        const inner = () => {
            for (var key in Registry) {
                if (key === cell.cell_type) {
                    return React.createElement(Registry[key].component, {
                        key: cell.uuid,
                        uuid: cell.uuid,
                    });
                }
            }

            return <Error key={cell.uuid} uuid={cell.uuid} />;
        };

        return (
            <ScrollWrapper key={cell.uuid} ref={(el) => (refs.current[index] = el)}>
                {inner()}
            </ScrollWrapper>
        );
    });

    return <div>{cells}</div>;
};

const InnerWorkspaceView: RefsFC = ({ refs }) => {
    const title = useAppSelector(selectWorkspaceTitle);

    if (title === undefined) {
        return <p>Loading workspace...</p>;
    }
    return (
        <>
            <Helmet>
                <title>{title} – exegete.app</title>
            </Helmet>
            <CellView refs={refs} />
        </>
    );
};

const RenameWorkspaceModal: React.FC<React.PropsWithChildren<{ show: boolean; setShow: (v: boolean) => void }>> = ({
    show,
    setShow,
}) => {
    const title = useAppSelector(selectWorkspaceTitle);
    const dispatch = useAppDispatch();
    const newTitle = useInput(title || "");

    const cancel = () => {
        setShow(false);
    };
    const save = () => {
        dispatch(workspaceSetTitle(newTitle.value));
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
    const workspaceState = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const cancel = () => {
        setShow(false);
    };

    // FIXME: this ought to be done with thunks..
    const apply = () => {
        deleteWorkspace(workspaceState.id, workspaceState.local);
        dispatch(workspaceDeleted());
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
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();

    if (!state.valid || !state.workspace) {
        return <></>;
    }
    const undo = () => {
        if (!state.workspace) {
            return;
        }
        dispatch(workspaceUndo());
    };
    const redo = () => {
        if (!state.workspace) {
            return;
        }
        dispatch(workspaceRedo());
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
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();

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
            dispatch(workspaceSetTextSize(newLevel));
        }
    };

    const reset = () => {
        if (!state.valid || !state.workspace) {
            return;
        }
        dispatch(workspaceSetTextSize(TextSize.MEDIUM));
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
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();
    const cells = state.workspace ? state.workspace.data.cells : [];
    const [newlyAdded, setNewlyAdded] = React.useState(false);

    const items: JSX.Element[] = [];

    for (const key in Registry) {
        const defn = Registry[key];
        for (let i = 0; i < defn.launchers.length; i++) {
            const launcher = defn.launchers[i];
            const newCell = () => {
                dispatch(workspaceCellAdd(makeNewCell(state.workspace!.data, key, defn, launcher)));
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
    const title = useAppSelector(selectWorkspaceTitle);
    const [showRenameWorkspaceModal, setShowRenameWorkspaceModal] = React.useState(false);
    const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] = React.useState(false);

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
                    title={title || "(loading)"}
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

export default WorkspaceView;
