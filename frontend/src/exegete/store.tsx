import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { backendApi } from "../api/api";
import workspaceReducer from "../workspace/Workspace";
import userReducer from "../user/User";
import { backendAuthApi } from "../api/apiauth";

export const store = configureStore({
    reducer: {
        [backendApi.reducerPath]: backendApi.reducer,
        [backendAuthApi.reducerPath]: backendAuthApi.reducer,
        workspace: workspaceReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(backendApi.middleware).concat(backendAuthApi.middleware),
});

// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
