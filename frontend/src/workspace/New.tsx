import { Workspace } from "./Workspace";

const defaultDocument: Workspace = {
    workspace_format: 1,
    cells: [
        {
            cell_type: "scripture-viewer",
            data: { shortcode: "NET", verseref: "Matthew 1" },
        },
    ],
};

export default defaultDocument;
