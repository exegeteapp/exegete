import { Delta } from "jsondiffpatch";

export type NewCellDataFn<T> = (workspace: WorkspaceData) => T;

export interface WorkspaceCell<T> {
    readonly cell_type: string;
    readonly uuid: string;
    readonly data: T;
}

export interface CellListingEntry {
    readonly cell_type: string;
    readonly uuid: string;
}

export enum TextSize {
    XXSMALL = "xx-small",
    XSMALL = "x-small",
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    XLARGE = "x-large",
    XXLARGE = "xx-large",
}

export type View = {
    textSize: TextSize;
};

export type Global = {
    view: View;
};

export type History = {
    readonly undo: Array<Delta>;
    readonly redo: Array<Delta>;
};

export interface WorkspaceData {
    workspace_format: number;
    cells: Array<WorkspaceCell<any>>;
    global: Global;
    history: History;
}

export interface WorkspaceMetadata {
    readonly id: string;
    readonly title: string;
    readonly data: WorkspaceData;
    readonly created: Date;
    readonly updated: Date | null;
}

// minimal set of metadata set on the frontend
// before the backend or local storage set the rest
export interface NewWorkspaceData {
    readonly id: string;
    readonly title: string;
    readonly data: WorkspaceData;
}
