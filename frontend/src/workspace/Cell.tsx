import { RegistryEntry, RegistryLauncher } from "./CellRegistry";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceData } from "./Types";

export const makeNewCell = (data: WorkspaceData, slug: string, defn: RegistryEntry, cell_data: any) => {
    return {
        cell_type: slug,
        uuid: uuidv4(),
        data: cell_data,
    };
};

export const makeNewCellFromLauncher = (
    data: WorkspaceData,
    slug: string,
    defn: RegistryEntry,
    launcher: RegistryLauncher,
) => {
    return {
        cell_type: slug,
        uuid: uuidv4(),
        data: launcher.newData(data),
    };
};
