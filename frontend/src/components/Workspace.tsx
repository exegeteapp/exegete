import React from "react";
import { useAppDispatch } from "../exegete/hooks";
import { LoadWorkspace, workspaceUnload } from "../workspace/Workspace";
import { WorkspaceAutoSave } from "./Autosave";

export type CellFC = React.FC<
    React.PropsWithChildren<{
        readonly uuid: string;
    }>
>;

export const WorkspaceProvider: React.FC<React.PropsWithChildren<{ id: string; local: boolean }>> = ({
    children,
    id,
    local,
}) => {
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(LoadWorkspace({ local, id }));
        return () => {
            dispatch(workspaceUnload());
        };
    }, [dispatch, local, id]);

    return <WorkspaceAutoSave>{children}</WorkspaceAutoSave>;
};
