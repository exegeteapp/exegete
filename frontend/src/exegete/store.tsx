import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { backendApi } from "../api/api";
import workspaceReducer from "../workspace/Workspace";
import userReducer from "../user/User";
import { backendAuthApi } from "../api/apiauth";
import { mdcontentApi } from "../api/mdcontent";

export const store = configureStore({
    reducer: {
        [backendApi.reducerPath]: backendApi.reducer,
        [backendAuthApi.reducerPath]: backendAuthApi.reducer,
        [mdcontentApi.reducerPath]: mdcontentApi.reducer,
        workspace: workspaceReducer,
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
