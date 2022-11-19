import React from "react";
import { useAppSelector } from "../../../exegete/hooks";
import { selectWorkspaceId, selectWorkspaceTitle } from "../../../workspace/Workspace";
import { GospelParallelModal } from "../../GospelParallelModal";
import { BaseHeader } from "../../Header";
import { DeleteWorkspaceModal } from "./DeleteWorkspaceModal";
import { EditMenu } from "./EditMenu";
import { RenameWorkspaceModal } from "./RenameWorkspace";
import { ToolsMenu } from "./ToolsMenu";
import { RefsFC } from "./Types";
import { ViewMenu } from "./ViewMenu";
import { WorkspaceMenu } from "./WorkspaceMenu";

export const WorkspaceHeader: RefsFC = ({ refs }) => {
    const id = useAppSelector(selectWorkspaceId);
    const title = useAppSelector(selectWorkspaceTitle);
    const [showGospelParallelModal, setShowGospelParallelModal] = React.useState(false);
    const [showRenameWorkspaceModal, setShowRenameWorkspaceModal] = React.useState(false);
    const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] = React.useState(false);

    // there's no point having modals in the DOM all the time, and it complicates state management.
    // we pop them into existence when needed.
    const modals: JSX.Element[] = [];
    if (showGospelParallelModal) {
        modals.push(
            <GospelParallelModal
                key={modals.length + 1}
                show={showGospelParallelModal}
                setShow={setShowGospelParallelModal}
            />
        );
    }
    if (showRenameWorkspaceModal) {
        modals.push(
            <RenameWorkspaceModal
                key={modals.length + 1}
                show={showRenameWorkspaceModal}
                setShow={setShowRenameWorkspaceModal}
            />
        );
    }
    if (showDeleteWorkspaceModal) {
        modals.push(
            <DeleteWorkspaceModal
                key={modals.length + 1}
                show={showDeleteWorkspaceModal}
                setShow={setShowDeleteWorkspaceModal}
            />
        );
    }

    return (
        <>
            {modals}
            <BaseHeader>
                <WorkspaceMenu
                    id={id}
                    title={title || "(loading)"}
                    setShowDeleteWorkspaceModal={setShowDeleteWorkspaceModal}
                    setShowRenameWorkspaceModal={setShowRenameWorkspaceModal}
                />
                <EditMenu />
                <ViewMenu />
                <ToolsMenu refs={refs} setShowGospelParallelModal={setShowGospelParallelModal} />
            </BaseHeader>
        </>
    );
};
