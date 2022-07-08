import React from "react";
import { reverse, patch } from "jsondiffpatch";
import { arrayMoveMutable } from "array-move";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../exegete/store";
import { Delta } from "jsondiffpatch";

export type NewCellDataFn<T> = (workspace: WorkspaceData) => T;

export interface WorkspaceCell<T> {
    readonly cell_type: string;
    readonly uuid: string;
    readonly data: T;
}

export interface CellListingEntry {
    readonly cell_type: string;
    readonly uuid: string;
}

export type CellFC = React.FC<
    React.PropsWithChildren<{
        readonly uuid: string;
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
    readonly undo: Array<Delta>;
    readonly redo: Array<Delta>;
};

export interface WorkspaceData {
    workspace_format: number;
    cells: Array<WorkspaceCell<any>>;
    global: Global;
    history: History;
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
    id: string;
    // have we gone through the bootstrap process?
    valid: boolean;
    // the working workspace data
    workspace: WorkspaceMetadata | undefined;
    // the last version of the workspace which we know is on the server
    // used to calculate undo and to avoid unnecessary saves
    last_workspace: WorkspaceMetadata | undefined;
    // a listing of all cells, detached from their data. this is a performance
    // optimisation for InnerWorkspaceView
    cell_listing: CellListingEntry[] | undefined;
    // does this workspace have unsaved changes?
    dirty: DirtyState;
    // workspace is local-only
    local: boolean;
    // can undo/redo functionality operate?
    can_apply_history: boolean;
}

const initialState: WorkspaceState = {
    id: "",
    valid: false,
    dirty: DirtyState.CLEAN,
    cell_listing: [],
    workspace: undefined,
    last_workspace: undefined,
    local: false,
    can_apply_history: true,
};

const cellIndex = (cells: ReadonlyArray<WorkspaceCell<any>>, uuid: string) => {
    return cells.findIndex((c) => c.uuid === uuid);
};

const buildCellListing = (workspace: WorkspaceMetadata | undefined): CellListingEntry[] => {
    if (!workspace) {
        return [];
    }
    return workspace.data.cells.map((c) => {
        return { uuid: c.uuid, cell_type: c.cell_type };
    });
};

export const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        workspaceStart: (state) => {
            state.valid = true;
        },
        workspaceUnload: (state) => {
            state.id = "";
            state.valid = false;
            state.dirty = DirtyState.CLEAN;
            state.workspace = state.last_workspace = undefined;
            state.cell_listing = buildCellListing(state.workspace);
            state.local = false;
            state.can_apply_history = true;
        },
        workspaceLoaded: (state, action: PayloadAction<WorkspaceMetadata>) => {
            state.workspace = action.payload;
            state.cell_listing = buildCellListing(state.workspace);
            state.last_workspace = action.payload;
            state.valid = true;
            state.dirty = DirtyState.CLEAN;
        },
        workspaceSaved: (state, action: PayloadAction<[WorkspaceMetadata, boolean]>) => {
            if (!state.workspace) {
                return;
            }
            const [workspace, set_history] = action.payload;
            // this is slightly complex. we want to set the last_workspace
            // to the version of the workspace metadata that has been saved.
            // we update the history on the current workspace object, but
            // leave the rest of the state intact, as there may have been edits
            // made by the user while the save operation was occurring
            if (set_history) {
                state.workspace.data.history = workspace.data.history;
                state.last_workspace = workspace;
                state.dirty = DirtyState.CLEAN;
            } else {
                state.last_workspace = workspace;
                state.dirty = DirtyState.CLEAN;
            }
        },
        workspaceDeleted: (state) => {
            state.workspace = undefined;
            state.cell_listing = buildCellListing(state.workspace);
            state.valid = false;
            state.dirty = DirtyState.CLEAN;
        },
        workspaceCellSet: (state, action: PayloadAction<[string, any]>) => {
            if (!state.workspace) {
                return;
            }
            const [uuid, data] = action.payload;
            const newCells = [...state.workspace.data.cells];
            const idx = cellIndex(newCells, uuid);
            if (idx !== -1) {
                newCells[idx] = { ...newCells[idx], data: data };
            }
            state.workspace.data.cells = newCells;
            state.dirty = DirtyState.MAKE_DELTA;
        },
        workspaceCellDelete: (state, action: PayloadAction<string>) => {
            if (!state.workspace) {
                return;
            }
            const uuid = action.payload;
            const newCells = state.workspace.data.cells.filter((c) => c.uuid !== uuid);
            state.workspace.data.cells = newCells;
            state.cell_listing = buildCellListing(state.workspace);
            state.dirty = DirtyState.MAKE_DELTA;
        },
        workspaceCanApplyHistory: (state, action: PayloadAction<boolean>) => {
            state.can_apply_history = action.payload;
        },
        workspaceCellMove: (state, action: PayloadAction<[string, number]>) => {
            if (!state.workspace) {
                return;
            }
            const [uuid, offset] = action.payload;

            const newCells = [...state.workspace.data.cells];
            const idx = cellIndex(newCells, uuid);
            if (idx !== -1) {
                arrayMoveMutable(newCells, idx, (idx + offset) % newCells.length);
            }
            state.workspace.data.cells = newCells;
            state.cell_listing = buildCellListing(state.workspace);
            state.dirty = DirtyState.MAKE_DELTA;
        },
        workspaceCellAdd: (state, action: PayloadAction<WorkspaceCell<any>>) => {
            if (!state.workspace) {
                return;
            }
            state.workspace.data.cells = [...state.workspace.data.cells, action.payload];
            state.cell_listing = buildCellListing(state.workspace);
            state.dirty = DirtyState.MAKE_DELTA;
        },
        workspaceSetTitle: (state, action: PayloadAction<string>) => {
            if (!state.workspace) {
                return;
            }
            state.workspace.title = action.payload;
            state.dirty = DirtyState.PUSH;
        },
        workspaceSetTextSize: (state, action: PayloadAction<TextSize>) => {
            if (!state.workspace) {
                return state;
            }
            state.workspace.data.global.view.textSize = action.payload;
            state.dirty = DirtyState.MAKE_DELTA;
        },
        workspaceUndo: (state) => {
            if (!state.workspace) {
                return;
            }
            const history = state.workspace.data.history;
            const delta = history.undo[0];
            if (!delta) {
                return;
            }
            const newData = patch(JSON.parse(JSON.stringify(state.workspace.data)), delta);
            state.workspace.data = {
                ...newData,
                history: {
                    ...history,
                    undo: history.undo.slice(1),
                    redo: [delta, ...history.redo],
                },
            };
            state.cell_listing = buildCellListing(state.workspace);
            // 'dirty' is not set here, if it was we'd push the new data
            // and then we'd generate undo history of unwinding undo history!
            state.dirty = DirtyState.PUSH;
        },
        workspaceRedo: (state) => {
            if (!state.workspace) {
                return;
            }
            const history = state.workspace.data.history;
            const delta = history.redo[0];
            if (!delta) {
                return;
            }
            const rev = reverse(delta);
            if (!rev) {
                return;
            }
            // jsondiffpatch mutates the original object, so we need to clone it
            const newData = patch(JSON.parse(JSON.stringify(state.workspace.data)), rev);
            state.workspace.data = {
                ...newData,
                history: {
                    ...history,
                    undo: [delta, ...history.undo],
                    redo: history.redo.slice(1),
                },
            };
            state.cell_listing = buildCellListing(state.workspace);
            // 'dirty' is not set here, if it was we'd push the new data
            // and then we'd generate undo history of unwinding undo history!
            state.dirty = DirtyState.PUSH;
        },
    },
});

export const {
    workspaceCanApplyHistory,
    workspaceCellAdd,
    workspaceCellDelete,
    workspaceCellMove,
    workspaceCellSet,
    workspaceDeleted,
    workspaceLoaded,
    workspaceSaved,
    workspaceRedo,
    workspaceUndo,
    workspaceSetTextSize,
    workspaceSetTitle,
    workspaceStart,
    workspaceUnload,
} = workspaceSlice.actions;

export const selectWorkspace = (state: RootState) => state.workspace;
export const selectWorkspaceCellListing = (state: RootState) => state.workspace.cell_listing;
export const selectWorkspaceTitle = (state: RootState) => {
    if (state.workspace.workspace) {
        return state.workspace.workspace.title;
    }
    return undefined;
};
export const selectWorkspaceGlobal = (state: RootState) => {
    if (!state.workspace.workspace) {
        return undefined;
    }
    return state.workspace.workspace.data.global;
};
export const selectWorkspaceCell = (uuid: string) => (state: RootState) => {
    if (!state.workspace.workspace) {
        return undefined;
    }
    for (const cell of state.workspace.workspace.data.cells) {
        if (cell.uuid === uuid) {
            return cell;
        }
    }
    return undefined;
};

export default workspaceSlice.reducer;
