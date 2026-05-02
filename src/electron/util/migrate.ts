import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { HistoryItem, Manga_BookItem } from "@common/types/legacy";
import { pingDatabaseChange } from "@electron/ipc/database";
import { app, dialog } from "electron";
import { type DatabaseService, DB_PATH } from "../db";
import { createMainLogger } from "./logger";

const logger = createMainLogger("migrate");

// migrate from 2.19.6 to sqlite
const userDataURL = app.getPath("userData");
const bookmarksPath = path.join(userDataURL, "bookmarks.json");
const historyPath = path.join(userDataURL, "history.json");

export const migrateToSqlite = async (
    db: DatabaseService,
    history: HistoryItem[],
    bookmarks: Manga_BookItem[],
): Promise<void> => {
    try {
        logger.log("SQLite migration: backing up existing data.db before JSON import");
        await fs.access(DB_PATH);
        const backupPath = path.join(userDataURL, `data.db-${Date.now()}.backup`);
        await fs.copyFile(DB_PATH, backupPath);
        await db.migrateFromJSON(history, bookmarks);
        await pingDatabaseChange("db:library:change");
        await pingDatabaseChange("db:bookmark:change");
        await fs.rename(bookmarksPath, path.join(userDataURL, "bookmarks.json.old"));
        await fs.rename(historyPath, path.join(userDataURL, "history.json.old"));
    } catch (error) {
        logger.error("SQLite migration from bookmarks/history JSON failed", error);
        dialog.showMessageBox({
            type: "error",
            message: "迁移到 SQLite 时出错",
            detail: String(error),
        });
    }
};

export const checkForJSONMigration = async (db: DatabaseService): Promise<void> => {
    const bookmarks: Manga_BookItem[] = [];
    const history: HistoryItem[] = [];
    try {
        if (existsSync(bookmarksPath)) {
            const data = await fs.readFile(bookmarksPath, "utf8");
            bookmarks.push(...JSON.parse(data));
        }
        if (existsSync(historyPath)) {
            const data = await fs.readFile(historyPath, "utf8");
            history.push(...JSON.parse(data));
        }

        if (bookmarks.length > 0 || history.length > 0) {
            const res = await dialog.showMessageBox({
                type: "question",
                message: "发现可迁移的旧书签和历史记录数据。",
                detail: "是否将其迁移到新的数据库系统？\n" + "迁移前会备份当前数据和旧数据。",
                buttons: ["是", "否"],
                defaultId: 0,
                cancelId: 1,
            });
            if (res.response === 0) {
                await migrateToSqlite(db, history, bookmarks);
            }
        }
    } catch (error) {
        logger.error("Could not read legacy bookmarks.json/history.json for migration offer", error);
    }
};
