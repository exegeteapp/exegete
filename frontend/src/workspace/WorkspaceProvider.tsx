import { v4 } from "uuid";
import { createWorkspaceAPI, deleteWorkspaceAPI } from "./APIWorkspaceStorage";
import { makeNewCellFromLauncher } from "./Cell";
import Registry from "./CellRegistry";
import { createWorkspaceLocal, deleteWorkspaceLocal } from "./LocalWorkspaceStorage";
import { NewWorkspaceData, TextSize, WorkspaceData } from "./Types";
import { CurrentWorkspaceFormat } from "./WorkspaceMigrations";

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
        cells: [makeNewCellFromLauncher(defaultDocument, newSlug, Registry[newSlug], Registry[newSlug].launchers[0])],
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
