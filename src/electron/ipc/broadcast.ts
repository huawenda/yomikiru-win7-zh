import type { DatabaseChangeChannels } from "@common/types/ipc";
import { BrowserWindow } from "electron";
import { createMainLogger } from "../util/logger";

const logger = createMainLogger("ipc/broadcast");

/**
 * Sends database change notifications to all open windows.
 */
export const pingDatabaseChange = async <T extends keyof DatabaseChangeChannels>(channel: T): Promise<void> => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
        if (!window.isDestroyed()) {
            try {
                window.webContents.send(channel);
            } catch (error) {
                logger.error(`Could not broadcast DB change "${String(channel)}" to a window`, error);
            }
        }
    });
};
