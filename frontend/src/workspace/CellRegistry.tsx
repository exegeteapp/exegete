import { MarkdownNoteSlug, MarkdownNoteDefinition } from "../components/Cells/MarkdownNote";
import { ScriptureSlug, ScriptureDefinition } from "../components/Cells/Scripture";
import { CellFC, NewCellDataFn } from "./Workspace";

export type RegistryLauncher = {
    title: string;
    newData: NewCellDataFn<any>;
};

export type RegistryEntry = {
    describe: (data: any) => string;
    component: CellFC;
    launchers: RegistryLauncher[];
};

interface CellRegistry {
    readonly [key: string]: RegistryEntry;
}

const Registry: CellRegistry = {
    [ScriptureSlug]: ScriptureDefinition,
    [MarkdownNoteSlug]: MarkdownNoteDefinition,
} as const;

export default Registry;
