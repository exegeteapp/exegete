import { ApiAxiosRequestConfig } from "../user/JWT";
import axios from "axios";
import { NewWorkspaceData, WorkspaceMetadata } from "./Workspace";

export const loadWorkspaceAPI = async (id: string) => {
    const resp = await axios.get<WorkspaceMetadata>(`/api/v1/workspace/${id}`, ApiAxiosRequestConfig());
    return resp.data;
};

export const saveWorkspaceAPI = async (workspace: WorkspaceMetadata) => {
    const resp = await axios.put<WorkspaceMetadata>(
        `/api/v1/workspace/${workspace.id}`,
        workspace,
        ApiAxiosRequestConfig()
    );
    if (resp.status === 200) {
        return true;
    }
    return false;
};

export const createWorkspaceAPI = async (newData: NewWorkspaceData): Promise<void> => {
    // we're missing a couple of members, but they're set on the server-side.
    await saveWorkspaceAPI(newData as WorkspaceMetadata);
};

export const deleteWorkspaceAPI = async (id: string) => {
    const resp = await axios.delete<WorkspaceMetadata>(`/api/v1/workspace/${id}`, ApiAxiosRequestConfig());
    if (resp.status === 200) {
        return true;
    }
    return false;
};
