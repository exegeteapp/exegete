import React from "react";
import axios from "axios";
import { IJwt, storeJwt, ApiAxiosRequestConfig, deleteJWT } from "./JWT";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useAppDispatch } from "../exegete/hooks";
import { RootState } from "../exegete/store";

interface User {
    readonly email: string;
    readonly is_active?: boolean;
    readonly is_superuser?: boolean;
    readonly is_verified?: boolean;
    readonly password?: string;
    readonly name: string;
    readonly affiliation?: string;
}

interface Captcha {
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

const initialState: UserState = {
    valid: false,
    user_error: undefined,
    login_error: undefined,
    registration_error: undefined,
    user: undefined,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        userStart: (state) => {
            state.valid = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(Register.fulfilled, (state, action) => {
            state.registration_error = action.payload.error;
            state.user = action.payload.user;
            state.valid = action.payload.success;
        });
        builder.addCase(Login.fulfilled, (state, action) => {
            state.login_error = action.payload.error;
            state.user = action.payload.user;
            state.valid = action.payload.success;
        });
        builder.addCase(Logout.fulfilled, (state, action) => {
            state.user = action.payload.user;
            state.valid = true; // we concretely know that we have no user
        });
        builder.addCase(Bootstrap.fulfilled, (state, action) => {
            const user = action.payload;
            // Note: it doesn't matter if we're logged in or not, what matters
            // is that we've checked.
            state.valid = true;
            state.user = user;
        });
    },
});

const getUser = async () => {
    try {
        const resp = await axios.get<User>("/api/v1/users/me", ApiAxiosRequestConfig());
        return resp.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 401) {
                // we're not logged in
                return undefined;
            }
        }
        return undefined;
    }
};

const doLogin = async (username: string, password: string) => {
    try {
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);
        const resp = await axios.post<IJwt>("/api/v1/auth/login", params);
        storeJwt(resp.data);
        return {
            success: true,
            error: undefined,
            user: await getUser(),
        };
    } catch (exc) {
        return {
            success: false,
            error: "username or password incorrect",
            user: undefined,
        };
    }
};

export const Register = createAsyncThunk("user/register", async (registerData: [User, Captcha], thunkAPI) => {
    const [user, captcha] = registerData;
    try {
        await axios.post<User>("/api/v1/auth/register", { user: user, captcha: captcha });
        await axios.post("/api/v1/auth/request-verify-token", {
            email: user.email,
        });
        return await doLogin(user.email, user.password!);
    } catch (exc) {
        return {
            success: false,
            user: undefined,
            error: "unable to contact registration API",
        };
    }
});

export const Login = createAsyncThunk("user/login", async (loginData: [string, string], thunkAPI) => {
    const [username, password] = loginData;
    return await doLogin(username, password);
});

export const Logout = createAsyncThunk("user/logout", async (thunkAPI) => {
    deleteJWT();
    return {
        success: true,
        user: await getUser(),
    };
});

export const Bootstrap = createAsyncThunk("user/bootstrap", async (thunkAPI) => {
    return await getUser();
});

export const UserLoggedIn = (state: UserState): boolean => {
    return state.valid === true && state.user !== undefined;
};

export const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const dispatch = useAppDispatch();

    dispatch(Bootstrap());

    return <div>{children}</div>;
};

export const selectUser = (state: RootState) => state.user;
export default userSlice.reducer;
