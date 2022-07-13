import { ApiAxiosRequestConfig } from "../user/JWT";
import axios from "axios";
import { WorkspaceData, WorkspaceMetadata } from "./Types";
import { Delta } from "jsondiffpatch";

export const getWorkspaces = async (): Promise<WorkspaceMetadata[]> => {
    // we want to convert the JSON object described below into
    // an object with JS data types
    interface RawWorkspaceMetadata {
        readonly id: string;
        readonly title: string;
        readonly data: WorkspaceData;
        readonly history: Delta[];
        readonly created: string;
        readonly updated: string | null;
    }

    const date_n = (d: string | null) => {
        if (!d) {
            return null;
        }
        return new Date(d);
    };
    const resp = await axios.get<RawWorkspaceMetadata[]>("/api/v1/workspace/", ApiAxiosRequestConfig());
    return resp.data.map((w) => {
        return {
            ...w,
            created: new Date(w.created),
            updated: date_n(w.updated),
        };
    });
};
