import { WorkspaceData, WorkspaceMetadata } from "./Workspace";

// we write a migration any time there's a breaking change to the workspace
// format. this includes changes to the definitions of the various cell types.
// we bump the format number every time there is such a change, and write a
// migration function to handle the transition to the new format. the migrations
// can then safely be chained.

const migrations: [toVersion: number, migration: (workspace: WorkspaceData) => WorkspaceData][] = [
    [
        2,
        (workspace: WorkspaceData) => {
            workspace.cells = workspace.cells.map((c) => {
                const newCell = { ...c };
                // parallel became the scripture cell type
                if (newCell.cell_type === "parallel") {
                    newCell.cell_type = "scripture";
                }
                // scripture-viewer became scripture; we merged the two
                if (newCell.cell_type === "scripture-viewer") {
                    const old_data = c.data as {
                        shortcode: any;
                        verseref: any;
                        hidemarkup: any;
                        annotation: any;
                    };
                    newCell.cell_type = "scripture";
                    newCell.data = {
                        hidemarkup: old_data.hidemarkup,
                        columns: [
                            {
                                shortcode: old_data.shortcode,
                                verseref: old_data.verseref,
                                annotation: old_data.annotation || [],
                            },
                        ],
                    };
                }
                return newCell;
            });
            return workspace;
        },
    ],
    [
        3,
        (workspace: WorkspaceData) => {
            // shortcode was added to annotation specifications; we just assume
            // NET was annotated against when migrating
            for (const c of workspace.cells) {
                // shortcode was added to annotation
                if (c.cell_type === "scripture") {
                    const data = c.data as any;
                    for (const column of data.columns) {
                        column.annotation = column.annotation.map((a: any) => {
                            a[0] = { ...a[0], shortcode: "NET" };
                            return a;
                        });
                    }
                    continue;
                }
            }
            return workspace;
        },
    ],
    [
        4,
        (workspace: WorkspaceData) => {
            // add global section to workspace
            (workspace as any)["global"] = { view: { textSize: "medium" } };
            return workspace;
        },
    ],
    [
        5,
        (workspace: WorkspaceData) => {
            for (const c of workspace.cells) {
                // parallel became the scripture cell type
                if (c.cell_type === "scripture") {
                    c.data["separateverses"] = false;
                }
            }
            return workspace;
        },
    ],
];
export const CurrentWorkspaceFormat = 5;

export const MigrateWorkspace = (w: WorkspaceMetadata | null): WorkspaceMetadata | null => {
    if (!w) {
        return null;
    }
    if (w.data.workspace_format === CurrentWorkspaceFormat) {
        return w;
    }

    // run migrations in sequence
    let newWorkspace: WorkspaceMetadata = { ...w };
    for (const [toVersion, migration] of migrations) {
        if (toVersion <= w.data.workspace_format) {
            continue;
        }
        newWorkspace = { ...newWorkspace, data: { ...migration(newWorkspace.data), workspace_format: toVersion } };
    }

    return w;
};
