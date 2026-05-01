import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UIState = {
    isOpen: {
        settings: boolean;
    };
};

const initialState: UIState = {
    isOpen: {
        settings: false,
    },
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setSettingsOpen: (state, action: PayloadAction<boolean>) => {
            state.isOpen.settings = action.payload;
        },
        toggleSettingsOpen: (state) => {
            state.isOpen.settings = !state.isOpen.settings;
        },
    },
});

export const { setSettingsOpen, toggleSettingsOpen } = uiSlice.actions;

export default uiSlice.reducer;
