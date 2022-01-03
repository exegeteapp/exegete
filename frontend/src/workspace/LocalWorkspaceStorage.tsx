
import LZString from 'lz-string';
import { validate as uuidValidate } from 'uuid';
import defaultDocument from './New';
import { Workspace } from './Workspace';
import { v4 } from 'uuid';

const idToKey = (id: string) => `workspace[${id}]`;

export const loadWorkspaceLocal = (id: string): Workspace | null => {
    if (!uuidValidate(id)) {
        return null;
    }
    const key = idToKey(id);
    const val = localStorage.getItem(key);
    if (!val) {
        return null;
    }
    const dval = LZString.decompress(val);
    if (!dval) {
        return null;
    }
    const obj = JSON.parse(dval);
    return obj as Workspace;
}

export const saveWorkspaceLocal = (workspace: Workspace): boolean => {
    if (!uuidValidate(workspace.id)) {
        return false;
    }
    workspace.updated = new Date();
    const encoded = LZString.compress(JSON.stringify(workspace));
    const key = idToKey(workspace.id);
    localStorage.setItem(key, encoded);
    return true;
}

export const createWorkspaceLocal = (): string => {
    const id = v4();
    const new_obj: Workspace = {
        id: id,
        title: 'Untitled',
        workspace: defaultDocument,
        created: new Date(),
        updated: null,
    }
    saveWorkspaceLocal(new_obj);
    return id;
}