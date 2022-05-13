import React from "react";
import { deleteWorkspaceLocal, loadWorkspaceLocal } from "./LocalWorkspaceStorage";
import { deleteWorkspaceAPI, loadWorkspaceAPI } from "./APIWorkspaceStorage";
import { arrayMoveMutable } from "array-move";
import { createWorkspaceAPI } from "../workspace/APIWorkspaceStorage";
import { createWorkspaceLocal } from "../workspace/LocalWorkspaceStorage";
import { v4 } from "uuid";
import defaultDocument from "../workspace/New";
import { makeNewCell } from "./Cell";
import Registry from "./CellRegistry";
import { WorkspaceAutoSave } from "./Autosave";
import { MigrateWorkspace } from "./WorkspaceMigrations";

export type NewCellDataFn<T> = (workspace: WorkspaceData) => T;

export interface WorkspaceCell<T> {
    cell_type: string;
    uuid: string;
    data: T;
}

export type CellFC<T> = React.FC<{
    cell: WorkspaceCell<T>;
}>;

export type View = {};

export type Global = {
    view: View;
};

export interface WorkspaceData {
    workspace_format: number;
    cells: WorkspaceCell<any>[];
    global: View;
}

export interface WorkspaceMetadata {
    id: string;
    title: string;
    data: WorkspaceData;
    created: Date;
    updated: Date | null;
}

// minimal set of metadata set on the frontend
// before the backend or local storage set the rest
export interface NewWorkspaceData {
    id: string;
    title: string;
    data: WorkspaceData;
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

const cloneWorkspaceData = (data: WorkspaceData): WorkspaceData => {
    // `data` must be JSON serialisable anyway, so this is seems
    // a reasonable way to achieve a deep clone
    return JSON.parse(JSON.stringify(data));
};

const cloneWorkspace = (ws: WorkspaceMetadata): WorkspaceMetadata => {
    return {
        ...ws,
        data: cloneWorkspaceData(ws.data),
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
    const data = cloneWorkspaceData(defaultDocument);

    const newData: NewWorkspaceData = {
        id: v4(),
        title: "Untitled",
        data: data,
    };
    const newSlug = "scripture";
    newData.data.cells.push(makeNewCell(data, newSlug, Registry[newSlug], Registry[newSlug].launchers[0]));

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
