import { ApiAxiosRequestConfig } from "../user/JWT";
import axios from "axios";
import { NewWorkspaceData, WorkspaceMetadata } from "./Types";
import sanitize from "sanitize-filename";

export const loadWorkspaceAPI = async (id: string) => {
    const resp = await axios.get<WorkspaceMetadata>(`/api/v1/workspace/${id}`, ApiAxiosRequestConfig());
    return resp.data;
};

export const downloadWorkspaceAPI = async (id: string, title: string) => {
    const filename = () => {
        return sanitize((title || id) + ".exegete");
    };
    const config = ApiAxiosRequestConfig();
    config.responseType = "blob";
    const resp = await axios.get(`/api/v1/workspace/download/${id}`, config);
    const url = window.URL.createObjectURL(new Blob([resp.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename());
    document.body.appendChild(link);
    link.click();
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
