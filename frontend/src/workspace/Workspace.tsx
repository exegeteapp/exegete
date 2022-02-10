import { ApiAxiosRequestConfig } from "../user/JWT";
import axios from "axios";
import React from "react";
import { loadWorkspaceLocal, saveWorkspaceLocal } from "./LocalWorkspaceStorage";
import { loadWorkspaceAPI, saveWorkspaceAPI } from "./APIWorkspaceStorage";

export interface WorkspaceCell<T> {
    cell_type: string;
    data: T;
}

export type CellFC<T> = React.FC<{
    cell: WorkspaceCell<T>;
    setCell: (data: T) => void;
}>;

export interface Workspace {
    workspace_format: number;
    cells: WorkspaceCell<any>[];
}

interface RawWorkspaceMetadata {
    id: string;
    title: string;
    workspace: Workspace;
    created: string;
    updated: string | null;
}

export interface WorkspaceMetadata {
    id: string;
    title: string;
    workspace: Workspace;
    created: Date;
    updated: Date | null;
}

export const getWorkspaces = async (): Promise<WorkspaceMetadata[]> => {
    const date_n = (d: string | null) => {
        if (!d) {
            return null;
        }
        return new Date(d);
    };
    const resp = await axios.get<RawWorkspaceMetadata[]>("/api/v1/workspace/", ApiAxiosRequestConfig());
    return resp.data.map((w) => {
        return {
            ...w,
            created: new Date(w.created),
            updated: date_n(w.updated),
        };
    });
};

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
    | { type: "workspace_cell_set"; cell: number; data: any }
    | { type: "workspace_set_title"; title: string }
    | { type: "workspace_saved" };

const workspace_reducer = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
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
        case "workspace_cell_set": {
            const clone = { ...state.workspace } as WorkspaceMetadata;
            clone.workspace!.cells[action.cell].data = action.data;
            return {
                ...state,
                workspace: clone,
                valid: true,
                dirty: true,
            };
        }
        case "workspace_set_title": {
            const clone = { ...state.workspace } as WorkspaceMetadata;
            clone.title = action.title;
            return {
                ...state,
                workspace: clone,
                valid: true,
                dirty: true,
            };
        }
        case "workspace_saved":
            return {
                ...state,
                dirty: false,
            };
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
