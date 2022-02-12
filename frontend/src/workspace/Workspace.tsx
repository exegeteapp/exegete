import React from "react";
import { deleteWorkspaceLocal, loadWorkspaceLocal, saveWorkspaceLocal } from "./LocalWorkspaceStorage";
import { deleteWorkspaceAPI, loadWorkspaceAPI, saveWorkspaceAPI } from "./APIWorkspaceStorage";
import { arrayMoveMutable } from "array-move";

export type NewCellDataFn<T> = (workspace: WorkspaceData) => T;

export interface WorkspaceCell<T> {
    cell_type: string;
    uuid: string;
    data: T;
}

export type CellFunctions = {
    set: (data: any) => void;
    delete: () => void;
    moveUp: () => void;
    moveDown: () => void;
};

export type CellFC<T> = React.FC<{
    cell: WorkspaceCell<T>;
    functions: CellFunctions;
}>;

export interface WorkspaceData {
    workspace_format: number;
    cells: WorkspaceCell<any>[];
}

export interface WorkspaceMetadata {
    id: string;
    title: string;
    data: WorkspaceData;
    created: Date;
    updated: Date | null;
}

interface WorkspaceState {
    id: string;
    // have we gone through the bootstrap process?
    valid: boolean;
    workspace: WorkspaceMetadata | undefined;
    // does this workspace have unsaved changes?
    dirty: boolean;
    // workspace is local-only
    local: boolean;
}

type WorkspaceAction =
    | { type: "workspace_start" }
    | { type: "workspace_loaded"; workspace: WorkspaceMetadata }
    | { type: "workspace_cell_set"; uuid: string; data: any }
    | { type: "workspace_cell_delete"; uuid: string }
    | { type: "workspace_cell_move"; uuid: string; offset: number }
    | { type: "workspace_cell_add"; cell: WorkspaceCell<any> }
    | { type: "workspace_set_title"; title: string }
    | { type: "workspace_deleted" }
    | { type: "workspace_saved" };

const cloneWorkspace = (ws: WorkspaceMetadata): WorkspaceMetadata => {
    // the `data` must be JSON serialisable anyway, so this is seems
    // a reasonable way to achieve a deep clone
    return {
        ...ws,
        data: JSON.parse(JSON.stringify(ws.data)),
    };
};

const workspace_reducer = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
    const cellIndex = (ws: WorkspaceMetadata, uuid: string) => {
        return ws.data.cells.findIndex((c) => c.uuid === uuid);
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
            const clone = cloneWorkspace(state.workspace);
            const idx = cellIndex(clone, action.uuid);
            if (idx !== -1) {
                clone.data.cells[idx].data = action.data;
            }
            return {
                ...state,
                workspace: clone,
                valid: true,
                dirty: true,
            };
        }
        case "workspace_cell_delete": {
            if (!state.workspace) {
                return state;
            }
            const clone = cloneWorkspace(state.workspace);
            const idx = cellIndex(clone, action.uuid);
            if (idx !== -1) {
                clone.data.cells.splice(idx, 1);
            }
            return {
                ...state,
                workspace: clone,
                valid: true,
                dirty: true,
            };
        }
        case "workspace_cell_move": {
            if (!state.workspace) {
                return state;
            }
            const clone = cloneWorkspace(state.workspace);
            const idx = cellIndex(clone, action.uuid);
            if (idx !== -1) {
                arrayMoveMutable(clone.data.cells, idx, (idx + action.offset) % clone.data.cells.length);
            }
            return {
                ...state,
                workspace: clone,
                valid: true,
                dirty: true,
            };
        }
        case "workspace_cell_add": {
            if (!state.workspace) {
                return state;
            }
            const clone = cloneWorkspace(state.workspace);
            clone.data!.cells = [...clone.data.cells, action.cell];
            return {
                ...state,
                workspace: clone,
                valid: true,
                dirty: true,
            };
        }
        case "workspace_set_title": {
            if (!state.workspace) {
                return state;
            }
            const clone = cloneWorkspace(state.workspace);
            clone.title = action.title;
            return {
                ...state,
                workspace: clone,
                valid: true,
                dirty: true,
            };
        }
    }
};

export interface IWorkspaceContext {
    state: WorkspaceState;
    dispatch: React.Dispatch<WorkspaceAction>;
}

// avoid default context value
// https://stackoverflow.com/questions/61333188/react-typescript-avoid-context-default-value
export const WorkspaceContext = React.createContext<IWorkspaceContext>({} as IWorkspaceContext);

export const WorkspaceAutoSave: React.FC = ({ children }) => {
    const { state, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    React.useEffect(() => {
        if (!state.workspace || !state.valid) {
            return;
        }
        if (!state.dirty) {
            return;
        }
        if (state.local) {
            saveWorkspaceLocal(state.workspace);
            dispatch({ type: "workspace_saved" });
        } else {
            saveWorkspaceAPI(state.workspace).then(() => {
                dispatch({ type: "workspace_saved" });
            });
        }
    }, [dispatch, state.valid, state.workspace, state.local, state.dirty]);
    return <>{children}</>;
};

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
            const workspace = await loadWorkspaceAPI(id);
            dispatch({ type: "workspace_loaded", workspace: workspace });
        }

        function getFromLocal() {
            const workspace = loadWorkspaceLocal(id);
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

export const deleteWorkspace = (id: string, local: boolean) => {
    if (local) {
        deleteWorkspaceLocal(id);
    } else {
        deleteWorkspaceAPI(id);
    }
};
