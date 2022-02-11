import { newScriptureCell, ScriptureCellData, ScriptureViewer } from "../components/Cells/ScriptureViewer";
import { CellFC, NewCellDataFn } from "./Workspace";

type RegistryEntry = {
    title: string;
    component: CellFC<ScriptureCellData>;
    newData: NewCellDataFn<ScriptureCellData>;
};

interface CellRegistry {
    [key: string]: RegistryEntry;
}

const Registry: CellRegistry = {
    "scripture-viewer": {
        title: "Scripture viewer",
        component: ScriptureViewer,
        newData: newScriptureCell,
    },
};

export default Registry;
