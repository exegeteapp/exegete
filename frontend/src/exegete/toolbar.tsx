import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface ToolbarState {
    show: boolean;
    type: string | undefined;
    data: any;
}

const initialState: ToolbarState = {
    show: false,
    type: undefined,
    data: undefined,
};

export const toolbarSlice = createSlice({
    name: "toolbar",
    initialState,
    reducers: {
        toolbarShow: (state, action: PayloadAction<[string, any]>) => {
            state.show = true;
            state.type = action.payload[0];
            state.data = action.payload[1];
        },
        toolbarHide: (state) => {
            state.show = false;
        },
    },
});

export const selectToolbar = (state: RootState) => state.toolbar;
export const { toolbarShow, toolbarHide } = toolbarSlice.actions;

export default toolbarSlice.reducer;
