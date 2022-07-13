import React from "react";
import { deleteWorkspaceLocal } from "./LocalWorkspaceStorage";
import { deleteWorkspaceAPI } from "./APIWorkspaceStorage";
import { createWorkspaceAPI } from "../workspace/APIWorkspaceStorage";
import { createWorkspaceLocal } from "../workspace/LocalWorkspaceStorage";
import { v4 } from "uuid";
import { makeNewCell } from "./Cell";
import Registry from "./CellRegistry";
import { WorkspaceAutoSave } from "./Autosave";
import { CurrentWorkspaceFormat } from "./WorkspaceMigrations";
import { useAppDispatch } from "../exegete/hooks";
import { LoadWorkspace, workspaceUnload } from "./Workspace";
import { NewWorkspaceData, TextSize, WorkspaceData } from "./Types";

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

const defaultDocument: WorkspaceData = {
    workspace_format: CurrentWorkspaceFormat,
    history: { undo: [], redo: [] },
    cells: [],
    global: { view: { textSize: TextSize.MEDIUM } },
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

export const deleteWorkspace = async (id: string, local: boolean) => {
    if (local) {
        deleteWorkspaceLocal(id);
    } else {
        await deleteWorkspaceAPI(id);
    }
};
