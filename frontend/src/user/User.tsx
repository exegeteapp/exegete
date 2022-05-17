import React from "react";
import axios from "axios";
import { IJwt, storeJwt, ApiAxiosRequestConfig, deleteJWT } from "./JWT";

interface User {
    readonly email: string;
    readonly is_active?: boolean;
    readonly is_superuser?: boolean;
    readonly is_verified?: boolean;
    readonly password?: string;
    readonly name: string;
    readonly affiliation?: string;
    readonly captcha?: string;
}

interface UserState {
    // have we bootstrapped the user process?
    readonly valid: boolean;
    // was there an error obtaining the state?
    readonly user_error: string | undefined;
    // was there an error logging in?
    readonly login_error: string | undefined;
    // was there an error registering?
    readonly registration_error: string | undefined;
    // if the user is undefined, we are not logged in
    readonly user: User | undefined;
}

const initialUserState = {
    valid: false,
    user_error: undefined,
    login_error: undefined,
    registration_error: undefined,
    user: undefined,
} as const;

type UserAction =
    | { type: "user_start" }
    | { type: "user_logout" }
    | { type: "user_login_error"; error: string }
    | { type: "user_registration_success" }
    | { type: "user_registration_error"; error: string }
    | { type: "user_error"; error: string }
    | { type: "user_login"; user: User | undefined };

const user_reducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case "user_start":
            return {
                ...state,
                valid: false,
            };
        case "user_error":
            return {
                ...state,
                valid: false,
                user: undefined,
                user_error: action.error,
            };
        case "user_login_error":
            return {
                ...state,
                valid: true,
                user: undefined,
                login_error: action.error,
            };
        case "user_registration_error":
            return {
                ...state,
                registration_error: action.error,
            };
        case "user_registration_success":
            return {
                ...state,
                registration_error: undefined,
            };
        case "user_login":
            return {
                ...state,
                user: action.user,
                login_error: undefined,
                valid: true,
            };
        case "user_logout":
            return {
                ...state,
                user: undefined,
                valid: true,
            };
    }
};

export interface IUserContext {
    state: UserState;
    dispatch: React.Dispatch<UserAction>;
}

export const UserContext = React.createContext<IUserContext>({
    state: initialUserState,
    dispatch: () => null,
});

export const Register = async (dispatch: React.Dispatch<UserAction>, user: User) => {
    try {
        dispatch({ type: "user_registration_success" });
        await axios.post<User>("/api/v1/auth/register", user);
        await axios.post("/api/v1/auth/request-verify-token", {
            email: user.email,
        });
    } catch (exc) {
        dispatch({
            type: "user_registration_error",
            error: "account registration failed",
        });
    }
    await getUser(dispatch);
};

export const Login = async (dispatch: React.Dispatch<UserAction>, username: string, password: string) => {
    try {
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);
        const resp = await axios.post<IJwt>("/api/v1/auth/login", params);
        storeJwt(resp.data);
        await getUser(dispatch);
    } catch (exc) {
        dispatch({
            type: "user_login_error",
            error: "username or password incorrect",
        });
    }
};

export const Logout = async (dispatch: React.Dispatch<UserAction>) => {
    deleteJWT();
    dispatch({ type: "user_logout" });
    await getUser(dispatch);
};

const getUser = async (dispatch: React.Dispatch<UserAction>) => {
    try {
        const resp = await axios.get<User>("/api/v1/users/me", ApiAxiosRequestConfig());
        dispatch({ type: "user_login", user: resp.data });
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 401) {
                // we're not logged in
                dispatch({ type: "user_login", user: undefined });
                return;
            }
        }
        dispatch({ type: "user_error", error: "unable to contact user API" });
        return;
    }
};

export const UserLoggedIn = (state: UserState): boolean => {
    return state.valid === true && state.user !== undefined;
};

export const UserProvider: React.FC = ({ children }) => {
    const [state, dispatch] = React.useReducer(user_reducer, initialUserState);

    React.useEffect(
        () => {
            async function bootstrap() {
                dispatch({ type: "user_start" });
                await getUser(dispatch);
            }
            bootstrap();
        },
        [] // only run once
    );

    return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
};
