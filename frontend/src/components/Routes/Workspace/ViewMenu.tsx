import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../../../exegete/hooks";
import { TextSize } from "../../../workspace/Types";
import { selectWorkspace, workspaceSetTextSize } from "../../../workspace/Workspace";

export const ViewMenu: React.FC<React.PropsWithChildren<unknown>> = () => {
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();

    const canZoom = (offset: number) => {
        if (!state.valid || !state.workspace) {
            return;
        }
        const levels = Object.values(TextSize);
        const toLevel = levels.indexOf(state.workspace.data.global.view.textSize) + offset;
        if (toLevel < 0 || toLevel >= levels.length) {
            return false;
        }
        return true;
    };

    const zoom = (offset: number) => {
        if (!state.valid || !state.workspace) {
            return;
        }

        const levels = Object.values(TextSize);
        const currentLevel = state.workspace.data.global.view.textSize;
        const currentIndex = levels.indexOf(currentLevel);
        if (currentIndex === -1) {
            return;
        }
        const targetIndex = currentIndex + offset;

        if (targetIndex >= 0 && targetIndex < levels.length) {
            const newLevel = levels[targetIndex];
            dispatch(workspaceSetTextSize(newLevel));
        }
    };

    const reset = () => {
        if (!state.valid || !state.workspace) {
            return;
        }
        dispatch(workspaceSetTextSize(TextSize.MEDIUM));
    };

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                View
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem disabled={!canZoom(1)} onClick={() => zoom(1)}>
                    Zoom In
                </DropdownItem>
                <DropdownItem disabled={!canZoom(-1)} onClick={() => zoom(-1)}>
                    Zoom Out
                </DropdownItem>
                <DropdownItem onClick={() => reset()}>Reset</DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
};
