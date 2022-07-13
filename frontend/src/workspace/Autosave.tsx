import React from "react";
import { DirtyState, SaveWorkspace, selectWorkspace } from "./Workspace";
import { useAppDispatch, useAppSelector } from "../exegete/hooks";

export const WorkspaceAutoSave: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
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
            dispatch(SaveWorkspace());
        }, 1000);

        return () => {
            window.clearTimeout(timeoutID);
        };
    }, [state.dirty, dispatch, state.local, state.valid, state.workspace, state.last_workspace]);
    return <>{children}</>;
};
