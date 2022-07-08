import React from "react";
import { deleteWorkspaceLocal, loadWorkspaceLocal } from "./LocalWorkspaceStorage";
import { deleteWorkspaceAPI, loadWorkspaceAPI } from "./APIWorkspaceStorage";
import { createWorkspaceAPI } from "../workspace/APIWorkspaceStorage";
import { createWorkspaceLocal } from "../workspace/LocalWorkspaceStorage";
import { v4 } from "uuid";
import { makeNewCell } from "./Cell";
import Registry from "./CellRegistry";
import { WorkspaceAutoSave } from "./Autosave";
import { CurrentWorkspaceFormat, MigrateWorkspace } from "./WorkspaceMigrations";
import { useAppDispatch } from "../exegete/hooks";
import {
    NewWorkspaceData,
    TextSize,
    WorkspaceData,
    workspaceLoaded,
    workspaceStart,
    workspaceUnload,
} from "./Workspace";

export const WorkspaceProvider: React.FC<React.PropsWithChildren<{ id: string; local: boolean }>> = ({
    children,
    id,
    local,
}) => {
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        async function getFromApi() {
            dispatch(workspaceStart());
            const workspace = MigrateWorkspace(await loadWorkspaceAPI(id));
            if (workspace) {
                dispatch(workspaceLoaded(workspace));
            }
        }

        function getFromLocal() {
            const workspace = MigrateWorkspace(loadWorkspaceLocal(id));
            if (workspace) {
                dispatch(workspaceLoaded(workspace));
            }
        }

        if (local) {
            getFromLocal();
        } else {
            getFromApi();
        }

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

export const deleteWorkspace = (id: string, local: boolean) => {
    if (local) {
        deleteWorkspaceLocal(id);
    } else {
        deleteWorkspaceAPI(id);
    }
};
