import MarkdownNote, { MarkdownNoteSlug, newMarkdownNoteCell } from "../components/Cells/MarkdownNote";
import { newScriptureCell, ScriptureViewer, ScriptureViewerSlug } from "../components/Cells/ScriptureViewer";
import { CellFC, NewCellDataFn } from "./Workspace";

export type RegistryEntry = {
    title: string;
    component: CellFC<any>;
    newData: NewCellDataFn<any>;
};

interface CellRegistry {
    [key: string]: RegistryEntry;
}

const Registry: CellRegistry = {
    [ScriptureViewerSlug]: {
        title: "Scripture viewer",
        component: ScriptureViewer,
        newData: newScriptureCell,
    },
    [MarkdownNoteSlug]: {
        title: "Note",
        component: MarkdownNote,
        newData: newMarkdownNoteCell,
    },
};

export default Registry;
