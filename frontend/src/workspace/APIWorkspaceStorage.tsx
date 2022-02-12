import { ApiAxiosRequestConfig } from "../user/JWT";
import axios from "axios";
import { WorkspaceMetadata } from "./Workspace";
import { v4 } from "uuid";
import defaultDocument from "./New";

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

export const createWorkspaceAPI = async (): Promise<string> => {
    const id = v4();
    const new_obj = {
        id: id,
        title: "Untitled",
        data: defaultDocument,
    };
    // we're missing a couple of members, but they're set on the server-side.
    await saveWorkspaceAPI(new_obj as WorkspaceMetadata);
    return id;
};

export const deleteWorkspaceAPI = async (id: string) => {
    const resp = await axios.delete<WorkspaceMetadata>(`/api/v1/workspace/${id}`, ApiAxiosRequestConfig());
    if (resp.status === 200) {
        return true;
    }
    return false;
};
