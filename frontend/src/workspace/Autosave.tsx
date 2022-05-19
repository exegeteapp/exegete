import React from "react";
import { saveWorkspaceAPI } from "./APIWorkspaceStorage";
import { saveWorkspaceLocal } from "./LocalWorkspaceStorage";
import { DirtyState, IWorkspaceContext, WorkspaceContext } from "./Workspace";
import { diff } from "jsondiffpatch";

export const WorkspaceAutoSave: React.FC = ({ children }) => {
    const { state, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    React.useEffect(() => {
        const makeWorkspaceDelta = () => {
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
        if (state.dirty === DirtyState.CLEAN) {
            return;
        }
        if (!state.workspace || !state.valid) {
            return;
        }
        const timeoutID = window.setTimeout(() => {
            if (!state.workspace || !state.valid || !state.last_workspace) {
                return;
            }
            const workspace = state.dirty === DirtyState.MAKE_DELTA ? makeWorkspaceDelta() : state.workspace;
            if (!workspace) {
                return;
            }
            if (state.local) {
                saveWorkspaceLocal(workspace);
                dispatch({ type: "workspace_saved", history: workspace.data.history });
            } else {
                saveWorkspaceAPI(workspace).then(() => {
                    dispatch({ type: "workspace_saved", history: workspace.data.history });
                });
            }
        }, 1000);

        return () => {
            window.clearTimeout(timeoutID);
        };
    }, [state.dirty, dispatch, state.local, state.valid, state.workspace, state.last_workspace]);
    return <>{children}</>;
};
