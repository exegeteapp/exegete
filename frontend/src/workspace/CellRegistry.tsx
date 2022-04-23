import { MarkdownNoteSlug, MarkdownNoteDefinition } from "../components/Cells/MarkdownNote";
import { ScriptureSlug, ScriptureDefinition } from "../components/Cells/Scripture";
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
    [ScriptureSlug]: ScriptureDefinition,
    [MarkdownNoteSlug]: MarkdownNoteDefinition,
};

export default Registry;
