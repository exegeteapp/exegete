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

export type NewCellDataFn<T> = (workspace: WorkspaceData) => T;

export interface WorkspaceCell<T> {
    readonly cell_type: string;
    readonly uuid: string;
    readonly data: T;
}

export type CellFC<T> = React.FC<{
    readonly cell: WorkspaceCell<T>;
}>;

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

export interface WorkspaceData {
    readonly workspace_format: number;
    readonly cells: ReadonlyArray<WorkspaceCell<any>>;
    readonly global: Global;
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

interface WorkspaceState {
    readonly id: string;
    // have we gone through the bootstrap process?
    readonly valid: boolean;
    readonly workspace: WorkspaceMetadata | undefined;
    // does this workspace have unsaved changes?
    readonly dirty: boolean;
    // workspace is local-only
    readonly local: boolean;
}

const defaultDocument: WorkspaceData = {
    workspace_format: CurrentWorkspaceFormat,
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
    | { type: "workspace_saved" };

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
                valid: true,
                dirty: false,
            };
        case "workspace_saved":
            return {
                ...state,
                dirty: false,
            };
        case "workspace_deleted":
            return {
                ...state,
                workspace: undefined,
                valid: false,
                dirty: false,
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
                dirty: true,
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
                dirty: true,
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
                dirty: true,
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
                dirty: true,
            };
        }
        case "workspace_set_title": {
            if (!state.workspace) {
                return state;
            }
            return {
                ...state,
                workspace: { ...state.workspace, title: action.title },
                dirty: true,
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
                dirty: true,
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

export const WorkspaceProvider: React.FC<{ id: string; local: boolean }> = ({ children, id, local }) => {
    const initialState: WorkspaceState = {
        id: id,
        valid: false,
        dirty: false,
        workspace: undefined,
        local: local,
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
