import type { MainSettingsType } from "@electron/util/mainSettings";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { mainSettingsApi } from "@shared/api/mainSettingsApi";

/**
 * @see src/electron/util/mainSettings.ts
 */
const initialState: MainSettingsType = {
    hardwareAcceleration: true,
    tempPath: window.electron.app.getPath("temp"),
    openInExistingWindow: false,
    askBeforeClosing: false,
};

export const updateMainSettings = createAsyncThunk(
    "mainSettings/update",
    async (settings: Partial<MainSettingsType>) => {
        await mainSettingsApi.update(settings);
    },
);
export const getMainSettings = createAsyncThunk("mainSettings/get", async () => {
    return await mainSettingsApi.get();
});

/**
 * ! it is automatically synced from ipc in all windows
 */

const mainSettings = createSlice({
    name: "mainSettings",
    initialState,
    reducers: {
        setMainSettings: (_state, action) => {
            return action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getMainSettings.fulfilled, (_state, action) => {
            return action.payload;
        });
    },
});

export const { setMainSettings } = mainSettings.actions;
export default mainSettings.reducer;
