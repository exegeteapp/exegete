import { RegistryEntry } from "./CellRegistry";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceData } from "./Workspace";

export const makeNewCell = (data: WorkspaceData, slug: string, defn: RegistryEntry) => {
    return {
        cell_type: slug,
        uuid: uuidv4(),
        data: defn.newData(data),
    };
};
