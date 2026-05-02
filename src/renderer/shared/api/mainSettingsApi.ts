import type { MainSettingsType } from "@electron/util/mainSettings";
import { ipcClient } from "@shared/platform/ipcClient";

export const mainSettingsApi = {
    get: () => ipcClient.invoke("mainSettings:get"),
    update: (settings: Partial<MainSettingsType>) => ipcClient.invoke("mainSettings:update", settings),
};
