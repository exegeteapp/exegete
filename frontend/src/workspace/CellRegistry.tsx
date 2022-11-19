import { MarkdownNoteDefinition, MarkdownNoteSlug } from "../components/Cells/MarkdownNote";
import { ScriptureDefinition, ScriptureSlug } from "../components/Cells/Scripture";
import { CellFC } from "../components/Workspace";
import { NewCellDataFn } from "./Types";

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
