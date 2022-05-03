import { WorkspaceData } from "./Workspace";
import { CurrentWorkspaceFormat } from "./WorkspaceMigrations";

const defaultDocument: WorkspaceData = {
    workspace_format: CurrentWorkspaceFormat,
    cells: [],
    view: {},
};

export default defaultDocument;
