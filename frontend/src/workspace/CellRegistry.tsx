import { MarkdownNoteSlug, MarkdownNoteDefinition } from "../components/Cells/MarkdownNote";
import { ScriptureViewerSlug, ScriptureViewerDefinition } from "../components/Cells/ScriptureViewer";
import { InnerTextureSlug, InnerTextureDefinition } from "../components/Cells/InnerTexture";
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
    [ScriptureViewerSlug]: ScriptureViewerDefinition,
    [MarkdownNoteSlug]: MarkdownNoteDefinition,
    [InnerTextureSlug]: InnerTextureDefinition,
};

export default Registry;
