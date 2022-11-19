import React from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../../../exegete/hooks";
import { DirtyState, selectWorkspace, workspaceRedo, workspaceUndo } from "../../../workspace/Workspace";

export const EditMenu: React.FC<React.PropsWithChildren<unknown>> = () => {
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();

    if (!state.valid || !state.workspace) {
        return <></>;
    }
    const undo = () => {
        if (!state.workspace) {
            return;
        }
        dispatch(workspaceUndo());
    };
    const redo = () => {
        if (!state.workspace) {
            return;
        }
        dispatch(workspaceRedo());
    };

    const cannotUndo = () => {
        return (
            state.history_blocked > 0 ||
            state.dirty !== DirtyState.CLEAN ||
            !state.workspace ||
            state.workspace.data.history.undo.length === 0
        );
    };

    const cannotRedo = () => {
        return (
            state.history_blocked > 0 ||
            state.dirty !== DirtyState.CLEAN ||
            !state.workspace ||
            state.workspace.data.history.redo.length === 0
        );
    };

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                Edit
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem disabled={cannotUndo()} onClick={() => undo()}>
                    Undo
                </DropdownItem>
                <DropdownItem disabled={cannotRedo()} onClick={() => redo()}>
                    Redo
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
};
