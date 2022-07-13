import React from "react";
import { reverse, patch, diff } from "jsondiffpatch";
import { arrayMoveMutable } from "array-move";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../exegete/store";
import { deleteWorkspace } from "./WorkspaceProvider";
import { CellListingEntry, TextSize, WorkspaceCell, WorkspaceMetadata } from "./Types";
import { loadWorkspaceLocal, saveWorkspaceLocal } from "./LocalWorkspaceStorage";
import { loadWorkspaceAPI, saveWorkspaceAPI } from "./APIWorkspaceStorage";
import { MigrateWorkspace } from "./WorkspaceMigrations";

export type CellFC = React.FC<
    React.PropsWithChildren<{
        readonly uuid: string;
    }>
>;

export enum DirtyState {
    CLEAN,
    PUSH,
    MAKE_DELTA,
}

interface WorkspaceState {
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
    reducers: {
        workspaceUnload: (state) => {
            state.valid = false;
            state.dirty = DirtyState.CLEAN;
            state.workspace = state.last_workspace = undefined;
            state.cell_listing = buildCellListing(state.workspace);
            state.local = false;
            state.can_apply_history = true;
        },
        workspaceCellSet: (state, action: PayloadAction<[string, any]>) => {
            if (!state.workspace) {
                return;
            }
            const [uuid, data] = action.payload;
            const idx = cellIndex(state.workspace.data.cells, uuid);
            // components may emit updates that have no content, skip these
            if (idx !== -1 && JSON.stringify(state.workspace.data.cells[idx].data) === JSON.stringify(data)) {
                return;
            }
            const newCells = [...state.workspace.data.cells];
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
            state.workspace.data.cells = state.workspace.data.cells.filter((c) => c.uuid !== uuid);
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
                return;
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
    extraReducers: (builder) => {
        builder.addCase(DeleteWorkspace.fulfilled, (state, action) => {
            state.workspace = undefined;
            state.cell_listing = undefined;
            state.valid = false;
            state.dirty = DirtyState.CLEAN;
        });
        builder.addCase(SaveWorkspace.fulfilled, (state, action) => {
            if (!state.workspace || !action.payload) {
                return;
            }
            const { workspace, set_history } = action.payload;
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
        });
        builder.addCase(LoadWorkspace.fulfilled, (state, action) => {
            const { workspace, local } = action.payload;
            state.workspace = state.last_workspace = workspace;
            state.cell_listing = buildCellListing(state.workspace);
            state.local = local;
            state.valid = true;
            state.dirty = DirtyState.CLEAN;
        });
    },
});

export const DeleteWorkspace = createAsyncThunk("workspace/delete", async (arg, thunkAPI) => {
    const state: WorkspaceState = (thunkAPI.getState() as any).workspace;
    if (state.workspace) {
        const id = state.workspace.id;
        await deleteWorkspace(id, state.local);
    }
});

export const LoadWorkspace = createAsyncThunk(
    "workspace/load",
    async ({ id, local }: { id: string; local: boolean }, thunkAPI) => {
        if (local) {
            const workspace = MigrateWorkspace(loadWorkspaceLocal(id));
            return {
                workspace: workspace,
                local: local,
            };
        } else {
            const workspace = MigrateWorkspace(await loadWorkspaceAPI(id));
            return {
                workspace: workspace,
                local: local,
            };
        }
    }
);

export const SaveWorkspace = createAsyncThunk("workspace/save", async (arg, thunkAPI) => {
    const state: WorkspaceState = (thunkAPI.getState() as any).workspace;

    const makeWorkspaceWithDelta = () => {
        if (!state.workspace || !state.last_workspace) {
            return undefined;
        }
        // calculate and push undo information
        const last = {
            cells: state.last_workspace.data.cells,
            global: state.last_workspace.data.global,
        };
        const now = {
            cells: state.workspace.data.cells,
            global: state.workspace.data.global,
        };
        const delta = diff(now, last);
        if (!delta) {
            return undefined;
        }
        return {
            ...state.workspace,
            data: {
                ...state.workspace.data,
                history: {
                    ...state.workspace.data.history,
                    undo: [delta, ...state.workspace.data.history.undo],
                    redo: [],
                },
            },
        };
    };

    const make_delta = state.dirty === DirtyState.MAKE_DELTA;
    const workspace = make_delta ? makeWorkspaceWithDelta() : state.workspace;
    if (!workspace) {
        return;
    }
    if (state.local) {
        saveWorkspaceLocal(workspace);
    } else {
        await saveWorkspaceAPI(workspace);
    }
    return {
        workspace: workspace,
        set_history: make_delta,
    };
});

export const {
    workspaceCanApplyHistory,
    workspaceCellAdd,
    workspaceCellDelete,
    workspaceCellMove,
    workspaceCellSet,
    workspaceRedo,
    workspaceUndo,
    workspaceSetTextSize,
    workspaceSetTitle,
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
