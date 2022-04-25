import { MarkdownNoteSlug, MarkdownNoteDefinition } from "../components/Cells/MarkdownNote";
import { ParallelDefinition, ParallelSlug } from "../components/Cells/Parallel";
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
    [ScriptureSlug]: ScriptureDefinition,
    [MarkdownNoteSlug]: MarkdownNoteDefinition,
    [ParallelSlug]: ParallelDefinition,
};

export default Registry;
