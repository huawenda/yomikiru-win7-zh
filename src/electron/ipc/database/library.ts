import { copyFile } from "node:fs/promises";
import path from "node:path";
import type { BookProgress, LibraryItem, MangaProgress } from "@common/types/db";
import { AddToLibrarySchema } from "@electron/db/validator";
import { createMainLogger } from "@electron/util/logger";
import { desc, eq } from "drizzle-orm";
import { app } from "electron";
import { DB_PATH } from "../../db";
import { bookProgress, libraryItems, mangaProgress } from "../../db/schema";
import { pingDatabaseChange } from "../broadcast";
import type { DatabaseHandlers } from "./types";

const logger = createMainLogger("ipc/database/library");

type LibraryChannel =
    | "db:library:getItem"
    | "db:library:getAllAndProgress"
    | "db:library:addItem"
    | "db:library:deleteItem"
    | "db:library:reset";

export const libraryHandlers: DatabaseHandlers<LibraryChannel> = {
    "db:library:getItem": async (db, request) => {
        const [item] = await db.db.select().from(libraryItems).where(eq(libraryItems.link, request.link));
        return item;
    },
    "db:library:getAllAndProgress": async (db) => {
        const itemsWithProgress = await db.db
            .select({
                item: libraryItems,
                mangaProgress: mangaProgress,
                bookProgress: bookProgress,
            })
            .from(libraryItems)
            .leftJoin(mangaProgress, eq(libraryItems.link, mangaProgress.itemLink))
            .leftJoin(bookProgress, eq(libraryItems.link, bookProgress.itemLink))
            .orderBy(desc(mangaProgress.lastReadAt), desc(bookProgress.lastReadAt));
        return itemsWithProgress.map(({ item, bookProgress, mangaProgress }) => ({
            ...item,
            progress: mangaProgress || bookProgress,
        })) as (
            | (LibraryItem & { type: "book"; progress: BookProgress })
            | (LibraryItem & { type: "manga"; progress: MangaProgress })
        )[];
    },
    "db:library:addItem": async (db, request) => {
        const data = (await db.addLibraryItem(AddToLibrarySchema.parse(request))) ?? null;
        pingDatabaseChange("db:library:change");
        return data;
    },
    "db:library:deleteItem": async (db, request) => {
        try {
            await db.db.delete(libraryItems).where(eq(libraryItems.link, request.link));
            pingDatabaseChange("db:library:change");
            pingDatabaseChange("db:bookmark:change");
            pingDatabaseChange("db:bookNote:change");
            return true;
        } catch (error) {
            logger.error('"db:library:deleteItem": delete failed', error);
            return false;
        }
    },
    "db:library:reset": async (db) => {
        try {
            const backupPath = path.join(app.getPath("userData"), `data_backup-${Date.now()}.db`);
            await copyFile(DB_PATH, backupPath);
            await db.db.delete(libraryItems);
            return true;
        } catch (err) {
            logger.error('"db:library:reset": backup or delete failed', err);
            return false;
        }
    },
};
