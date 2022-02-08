import { AxiosRequestConfig } from "axios";

export interface IJwt {
    access_token: string;
    token_type: string;
}

export const storeJwt = (jwt: IJwt) => {
    localStorage.setItem("jwt", JSON.stringify(jwt));
};

export const getJwt = (): IJwt | null => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
        return JSON.parse(jwt);
    }
    return null;
};

export const deleteJWT = () => {
    localStorage.removeItem("jwt");
};

export const ApiAxiosRequestConfig = (): AxiosRequestConfig => {
    let headers: any = { "Content-Type": "application/json" };
    const token = getJwt();
    if (token) {
        headers["Authorization"] = token.token_type + " " + token.access_token;
    }
    return {
        headers: headers,
    };
};
