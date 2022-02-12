import {
    newScriptureCell,
    ScriptureCellData,
    ScriptureViewer,
    ScriptureViewerSlug,
} from "../components/Cells/ScriptureViewer";
import { CellFC, NewCellDataFn } from "./Workspace";

export type RegistryEntry = {
    title: string;
    component: CellFC<ScriptureCellData>;
    newData: NewCellDataFn<ScriptureCellData>;
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
};

export default Registry;
