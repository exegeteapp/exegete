import React from "react";
import { CurrentWorkspaceFormat } from "./WorkspaceMigrations";
import { deleteWorkspaceLocal, loadWorkspaceLocal } from "./LocalWorkspaceStorage";
import { deleteWorkspaceAPI, loadWorkspaceAPI } from "./APIWorkspaceStorage";
import { arrayMoveMutable } from "array-move";
import { createWorkspaceAPI } from "../workspace/APIWorkspaceStorage";
import { createWorkspaceLocal } from "../workspace/LocalWorkspaceStorage";
import { v4 } from "uuid";
import { makeNewCell } from "./Cell";
import Registry from "./CellRegistry";
import { WorkspaceAutoSave } from "./Autosave";
import { MigrateWorkspace } from "./WorkspaceMigrations";
import { Delta } from "jsondiffpatch";

export type NewCellDataFn<T> = (workspace: WorkspaceData) => T;

export interface WorkspaceCell<T> {
    readonly cell_type: string;
    readonly uuid: string;
    readonly data: T;
}

export type CellFC<T> = React.FC<
    React.PropsWithChildren<{
        readonly cell: WorkspaceCell<T>;
    }>
>;

export enum TextSize {
    XXSMALL = "xx-small",
    XSMALL = "x-small",
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    XLARGE = "x-large",
    XXLARGE = "xx-large",
}

export type View = {
    textSize: TextSize;
};

export type Global = {
    view: View;
};

export type History = {
    readonly undo: ReadonlyArray<Delta>;
    readonly redo: ReadonlyArray<Delta>;
};

export interface WorkspaceData {
    readonly workspace_format: number;
    readonly cells: ReadonlyArray<WorkspaceCell<any>>;
    readonly global: Global;
    readonly history: History;
}

export interface WorkspaceMetadata {
    readonly id: string;
    readonly title: string;
    readonly data: WorkspaceData;
    readonly created: Date;
    readonly updated: Date | null;
}

// minimal set of metadata set on the frontend
// before the backend or local storage set the rest
export interface NewWorkspaceData {
    readonly id: string;
    readonly title: string;
    readonly data: WorkspaceData;
}

export enum DirtyState {
    CLEAN,
    PUSH,
    MAKE_DELTA,
}

interface WorkspaceState {
    readonly id: string;
    // have we gone through the bootstrap process?
    readonly valid: boolean;
    // the working workspace data
    readonly workspace: WorkspaceMetadata | undefined;
    // the last version of the workspace which we know is on the server
    // used to calculate undo and to avoid unnecessary saves
    readonly last_workspace: WorkspaceMetadata | undefined;
    // does this workspace have unsaved changes?
    readonly dirty: DirtyState;
    // workspace is local-only
    readonly local: boolean;
    // can undo/redo functionality operate?
    readonly can_apply_history: boolean;
}

const defaultDocument: WorkspaceData = {
    workspace_format: CurrentWorkspaceFormat,
    history: { undo: [], redo: [] },
    cells: [],
    global: { view: { textSize: TextSize.MEDIUM } },
} as const;

export type WorkspaceAction =
    | { type: "workspace_start" }
    | { type: "workspace_loaded"; workspace: WorkspaceMetadata }
    | { type: "workspace_cell_set"; uuid: string; data: any }
    | { type: "workspace_cell_delete"; uuid: string }
    | { type: "workspace_cell_move"; uuid: string; offset: number }
    | { type: "workspace_cell_add"; cell: WorkspaceCell<any> }
    | { type: "workspace_set_title"; title: string }
    | { type: "workspace_set_text_size"; text_size: TextSize }
    | { type: "workspace_deleted" }
    | { type: "workspace_set_from_history"; data: WorkspaceData }
    | { type: "workspace_saved"; workspace: WorkspaceMetadata; set_history: boolean }
    | { type: "workspace_can_apply_history"; value: boolean };

const workspace_reducer = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
    const cellIndex = (cells: ReadonlyArray<WorkspaceCell<any>>, uuid: string) => {
        return cells.findIndex((c) => c.uuid === uuid);
    };

    switch (action.type) {
        case "workspace_start":
            return {
                ...state,
                valid: false,
            };
        case "workspace_loaded":
            return {
                ...state,
                workspace: action.workspace,
                last_workspace: action.workspace,
                valid: true,
                dirty: DirtyState.CLEAN,
            };
        case "workspace_saved":
            if (!state.workspace) {
                return state;
            }
            // this is slightly complex. we want to set the last_workspace
            // to the version of the workspace metadata that has been saved.
            // we update the history on the current workspace object, but
            // leave the rest of the state intact, as there may have been edits
            // made by the user while the save operation was occurring
            if (action.set_history) {
                const merged: WorkspaceMetadata = {
                    ...state.workspace,
                    data: {
                        ...state.workspace.data,
                        history: action.workspace.data.history,
                    },
                };
                return {
                    ...state,
                    last_workspace: action.workspace,
                    workspace: merged,
                    dirty: DirtyState.CLEAN,
                };
            } else {
                return {
                    ...state,
                    last_workspace: action.workspace,
                    dirty: DirtyState.CLEAN,
                };
            }
        case "workspace_deleted":
            return {
                ...state,
                workspace: undefined,
                valid: false,
                dirty: DirtyState.CLEAN,
            };
        case "workspace_set_from_history":
            if (!state.workspace) {
                return state;
            }
            // 'dirty' is not set here, if it was we'd push the new data
            // and then we'd generate undo history of unwinding undo history!
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    data: action.data,
                },
                dirty: DirtyState.PUSH,
            };
        case "workspace_cell_set": {
            if (!state.workspace) {
                return state;
            }
            const newCells = [...state.workspace.data.cells];
            const idx = cellIndex(newCells, action.uuid);
            if (idx !== -1) {
                newCells[idx] = { ...newCells[idx], data: action.data };
            }
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    data: {
                        ...state.workspace.data,
                        cells: newCells,
                    },
                },
                dirty: DirtyState.MAKE_DELTA,
            };
        }
        case "workspace_cell_delete": {
            if (!state.workspace) {
                return state;
            }
            const newCells = state.workspace.data.cells.filter((c) => c.uuid !== action.uuid);
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    data: {
                        ...state.workspace.data,
                        cells: newCells,
                    },
                },
                dirty: DirtyState.MAKE_DELTA,
            };
        }
        case "workspace_can_apply_history": {
            return {
                ...state,
                can_apply_history: action.value,
            };
        }
        case "workspace_cell_move": {
            if (!state.workspace) {
                return state;
            }

            const newCells = [...state.workspace.data.cells];
            const idx = cellIndex(newCells, action.uuid);
            if (idx !== -1) {
                arrayMoveMutable(newCells, idx, (idx + action.offset) % newCells.length);
            }
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    data: {
                        ...state.workspace.data,
                        cells: newCells,
                    },
                },
                dirty: DirtyState.MAKE_DELTA,
            };
        }
        case "workspace_cell_add": {
            if (!state.workspace) {
                return state;
            }
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    data: {
                        ...state.workspace.data,
                        cells: [...state.workspace.data.cells, action.cell],
                    },
                },
                dirty: DirtyState.MAKE_DELTA,
            };
        }
        case "workspace_set_title": {
            if (!state.workspace) {
                return state;
            }
            return {
                ...state,
                workspace: { ...state.workspace, title: action.title },
                dirty: DirtyState.PUSH,
            };
        }
        case "workspace_set_text_size": {
            if (!state.workspace) {
                return state;
            }
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    data: {
                        ...state.workspace.data,
                        global: {
                            ...state.workspace.data.global,
                            view: {
                                ...state.workspace.data.global.view,
                                textSize: action.text_size,
                            },
                        },
                    },
                },
                dirty: DirtyState.MAKE_DELTA,
            };
        }
    }
};

export interface IWorkspaceContext {
    readonly state: WorkspaceState;
    readonly dispatch: React.Dispatch<WorkspaceAction>;
}

// avoid default context value
// https://stackoverflow.com/questions/61333188/react-typescript-avoid-context-default-value
export const WorkspaceContext = React.createContext<IWorkspaceContext>({} as IWorkspaceContext);

export const WorkspaceProvider: React.FC<React.PropsWithChildren<{ id: string; local: boolean }>> = ({
    children,
    id,
    local,
}) => {
    const initialState: WorkspaceState = {
        id: id,
        valid: false,
        dirty: DirtyState.CLEAN,
        workspace: undefined,
        last_workspace: undefined,
        local: local,
        can_apply_history: true,
    };
    const [state, dispatch] = React.useReducer(workspace_reducer, initialState);

    React.useEffect(() => {
        async function getFromApi() {
            dispatch({ type: "workspace_start" });
            const workspace = MigrateWorkspace(await loadWorkspaceAPI(id));
            if (workspace) {
                dispatch({ type: "workspace_loaded", workspace: workspace });
            }
        }

        function getFromLocal() {
            const workspace = MigrateWorkspace(loadWorkspaceLocal(id));
            if (workspace) {
                dispatch({ type: "workspace_loaded", workspace: workspace });
            }
        }

        if (local) {
            getFromLocal();
        } else {
            getFromApi();
        }
    }, [local, id]);

    return (
        <WorkspaceContext.Provider value={{ state, dispatch }}>
            <WorkspaceAutoSave>{children}</WorkspaceAutoSave>
        </WorkspaceContext.Provider>
    );
};

export const createWorkspace = async (local: boolean) => {
    const newSlug = "scripture";
    const data = {
        ...defaultDocument,
        cells: [makeNewCell(defaultDocument, newSlug, Registry[newSlug], Registry[newSlug].launchers[0])],
    };
    const newData: NewWorkspaceData = {
        id: v4(),
        title: "Untitled",
        data: data,
    } as const;

    if (local) {
        createWorkspaceLocal(newData);
    } else {
        await createWorkspaceAPI(newData);
    }
    return newData.id;
};

export const deleteWorkspace = (id: string, local: boolean) => {
    if (local) {
        deleteWorkspaceLocal(id);
    } else {
        deleteWorkspaceAPI(id);
    }
};

export const workspaceCellSet = (dispatch: React.Dispatch<WorkspaceAction>, uuid: string, data: any) => {
    dispatch({ type: "workspace_cell_set", uuid: uuid, data: data });
};

export const workspaceCellDelete = (dispatch: React.Dispatch<WorkspaceAction>, uuid: string) => {
    dispatch({ type: "workspace_cell_delete", uuid: uuid });
};

export const workspaceCellMove = (dispatch: React.Dispatch<WorkspaceAction>, uuid: string, offset: number) => {
    dispatch({ type: "workspace_cell_move", uuid: uuid, offset: offset });
};
