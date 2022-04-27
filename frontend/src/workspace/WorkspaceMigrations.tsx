import { WorkspaceData, WorkspaceMetadata } from "./Workspace";

// we write a migration any time there's a breaking change to the workspace
// format. this includes changes to the definitions of the various cell types.
// we bump the format number every time there is such a change, and write a
// migration function to handle the transition to the new format. the migrations
// can then safely be chained.

export const CurrentWorkspaceFormat = 2;
const migrations: [toVersion: number, migration: (workspace: WorkspaceData) => WorkspaceData][] = [
    [
        2,
        (workspace: WorkspaceData) => {
            for (const c of workspace.cells) {
                // parallel became the scripture cell type
                if (c.cell_type === "parallel") {
                    c.cell_type = "scripture";
                }
                // scripture-viewer became scripture; we merged the two
                if (c.cell_type === "scripture-viewer") {
                    const old_data = c.data as {
                        shortcode: any;
                        verseref: any;
                        hidemarkup: any;
                        annotation: any;
                    };
                    c.cell_type = "scripture";
                    c.data = {
                        hidemarkup: old_data.hidemarkup,
                        columns: [
                            {
                                shortcode: old_data.shortcode,
                                verseref: old_data.verseref,
                                annotation: old_data.annotation,
                            },
                        ],
                    };
                }
            }
            return workspace;
        },
    ],
];

export const MigrateWorkspace = (w: WorkspaceMetadata | null): WorkspaceMetadata | null => {
    if (!w) {
        return null;
    }
    if (w.data.workspace_format === CurrentWorkspaceFormat) {
        return w;
    }

    // run migrations in sequence
    for (const [toVersion, migration] of migrations) {
        if (toVersion <= w.data.workspace_format) {
            continue;
        }
        w.data = migration(w.data);
        w.data.workspace_format = toVersion;
    }

    return w;
};
