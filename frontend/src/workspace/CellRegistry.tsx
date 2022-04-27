import { MarkdownNoteSlug, MarkdownNoteDefinition } from "../components/Cells/MarkdownNote";
import { ScriptureSlug, ScriptureDefinition } from "../components/Cells/Scripture";
import { CellFC, NewCellDataFn } from "./Workspace";

export type RegistryLauncher = {
    title: string;
    newData: NewCellDataFn<any>;
};

export type RegistryEntry = {
    component: CellFC<any>;
    launchers: RegistryLauncher[];
};

interface CellRegistry {
    [key: string]: RegistryEntry;
}

const Registry: CellRegistry = {
    [MarkdownNoteSlug]: MarkdownNoteDefinition,
    [ScriptureSlug]: ScriptureDefinition,
};

export default Registry;
