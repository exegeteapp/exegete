import { reverse, patch } from "jsondiffpatch";
import { WorkspaceAction, WorkspaceData } from "./Workspace";

export const WorkspaceUndo = (dispatch: React.Dispatch<WorkspaceAction>, data: WorkspaceData) => {
    const history = data.history;
    const delta = history.undo[0];
    if (!delta) {
        return;
    }
    const newData = patch(JSON.parse(JSON.stringify(data)), delta);
    dispatch({
        type: "workspace_set_from_history",
        data: {
            ...newData,
            history: {
                ...data.history,
                undo: data.history.undo.slice(1),
                redo: [delta, ...data.history.redo],
            },
        },
    });
};

export const WorkspaceRedo = (dispatch: React.Dispatch<WorkspaceAction>, data: WorkspaceData) => {
    const history = data.history;
    const delta = history.redo[0];
    if (!delta) {
        return;
    }
    const rev = reverse(delta);
    if (!rev) {
        return;
    }
    // jsondiffpatch mutates the original object, so we need to clone it
    const newData = patch(JSON.parse(JSON.stringify(data)), rev);
    dispatch({
        type: "workspace_set_from_history",
        data: {
            ...newData,
            history: {
                ...data.history,
                undo: [delta, ...data.history.undo],
                redo: data.history.redo.slice(1),
            },
        },
    });
};
