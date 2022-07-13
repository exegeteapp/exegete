import LZString from "lz-string";
import { validate as uuidValidate } from "uuid";
import { NewWorkspaceData, WorkspaceMetadata } from "./Types";
import { v4 } from "uuid";

const idToKey = (id: string) => `workspace[${id}]`;

export const loadWorkspaceLocal = (id: string): WorkspaceMetadata | undefined => {
    if (!uuidValidate(id)) {
        return undefined;
    }
    const key = idToKey(id);
    const val = localStorage.getItem(key);
    if (!val) {
        return undefined;
    }
    const dval = LZString.decompress(val);
    if (!dval) {
        return undefined;
    }
    const obj = JSON.parse(dval);
    return obj as WorkspaceMetadata;
};

export const saveWorkspaceLocal = (workspace: WorkspaceMetadata): boolean => {
    if (!uuidValidate(workspace.id)) {
        return false;
    }
    // if we went through the full update cycle, we'd loop
    const saveWorkspace: WorkspaceMetadata = {
        ...workspace,
        updated: new Date(),
    };
    const encoded = LZString.compress(JSON.stringify(saveWorkspace));
    const key = idToKey(saveWorkspace.id);
    localStorage.setItem(key, encoded);
    return true;
};

export const createWorkspaceLocal = (newData: NewWorkspaceData): string => {
    const id = v4();
    const new_obj: WorkspaceMetadata = {
        ...newData,
        created: new Date(),
        updated: null,
    };
    saveWorkspaceLocal(new_obj);
    return id;
};

export const deleteWorkspaceLocal = (id: string): boolean => {
    if (!uuidValidate(id)) {
        return false;
    }
    const key = idToKey(id);
    localStorage.removeItem(key);
    return true;
};
