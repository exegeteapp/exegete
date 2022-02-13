import React from "react";
import { saveWorkspaceAPI } from "./APIWorkspaceStorage";
import { saveWorkspaceLocal } from "./LocalWorkspaceStorage";
import { IWorkspaceContext, WorkspaceContext } from "./Workspace";

export const WorkspaceAutoSave: React.FC = ({ children }) => {
    const { state, dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    React.useEffect(() => {
        if (!state.dirty) {
            return;
        }
        if (!state.workspace || !state.valid) {
            return;
        }
        const timeoutID = window.setTimeout(() => {
            if (!state.workspace || !state.valid) {
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
        }, 1000);

        return () => {
            window.clearTimeout(timeoutID);
        };
    }, [state.dirty, dispatch, state.local, state.valid, state.workspace]);
    return <>{children}</>;
};
