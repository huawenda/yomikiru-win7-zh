import type { DatabaseChannels } from "@common/types/ipc";
import { createMainLogger } from "@electron/util/logger";
import { ipcMain } from "electron";
import type { DatabaseService } from "../db";
import { bookHandlers } from "./database/book";
import { bookmarkHandlers } from "./database/bookmarks";
import { libraryHandlers } from "./database/library";
import { mangaHandlers } from "./database/manga";
import { noteHandlers } from "./database/notes";
import type { DatabaseHandlers } from "./database/types";

export { pingDatabaseChange } from "./broadcast";

const logger = createMainLogger("ipc/database");

const handlers: DatabaseHandlers = {
    ...libraryHandlers,
    ...mangaHandlers,
    ...bookHandlers,
    ...bookmarkHandlers,
    ...noteHandlers,
};

export function setupDatabaseHandlers(db: DatabaseService): void {
    for (const channel in handlers) {
        ipcMain.handle(channel, async (_, request) => {
            try {
                return await handlers[channel as keyof DatabaseChannels](db, request);
            } catch (error) {
                logger.error(`"${channel}": handler threw`, error, "request:", request);
                return null;
            }
        });
    }
}
