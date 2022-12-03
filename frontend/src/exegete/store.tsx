import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { backendApi } from "../api/api";
import { backendAuthApi } from "../api/apiauth";
import { mdcontentApi } from "../api/mdcontent";
import toolbarReducer from "./toolbar";
import userReducer from "../user/User";
import workspaceReducer from "../workspace/Workspace";

export const store = configureStore({
    reducer: {
        [backendApi.reducerPath]: backendApi.reducer,
        [backendAuthApi.reducerPath]: backendAuthApi.reducer,
        [mdcontentApi.reducerPath]: mdcontentApi.reducer,
        workspace: workspaceReducer,
        toolbar: toolbarReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(backendApi.middleware)
            .concat(backendAuthApi.middleware)
            .concat(mdcontentApi.middleware),
});

// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
