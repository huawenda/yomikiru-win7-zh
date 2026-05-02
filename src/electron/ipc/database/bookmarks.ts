import { AddBookBookmarkSchema, AddMangaBookmarkSchema } from "@electron/db/validator";
import { and, eq, inArray } from "drizzle-orm";
import { bookBookmarks, mangaBookmarks } from "../../db/schema";
import { pingDatabaseChange } from "../broadcast";
import type { DatabaseHandlers } from "./types";

type BookmarkChannel =
    | "db:library:getAllBookmarks"
    | "db:manga:getBookmarks"
    | "db:manga:addBookmark"
    | "db:manga:deleteBookmarks"
    | "db:book:getBookmarks"
    | "db:book:addBookmark"
    | "db:book:deleteBookmarks";

export const bookmarkHandlers: DatabaseHandlers<BookmarkChannel> = {
    "db:library:getAllBookmarks": async (db) => {
        const mangaBk = await db.db.select().from(mangaBookmarks);
        const bookBk = await db.db.select().from(bookBookmarks);
        return {
            mangaBookmarks: mangaBk,
            bookBookmarks: bookBk,
        };
    },
    "db:manga:getBookmarks": async (db, request) => {
        return await db.db.select().from(mangaBookmarks).where(eq(mangaBookmarks.itemLink, request.itemLink));
    },
    "db:manga:addBookmark": async (db, request) => {
        const data =
            (await db.db.insert(mangaBookmarks).values(AddMangaBookmarkSchema.parse(request)).returning())?.[0] ??
            null;
        if (data) pingDatabaseChange("db:bookmark:change");
        return data;
    },
    "db:manga:deleteBookmarks": async (db, request) => {
        if (request.all) {
            await db.db.delete(mangaBookmarks).where(eq(mangaBookmarks.itemLink, request.itemLink));
            return true;
        }
        await db.db
            .delete(mangaBookmarks)
            .where(and(eq(mangaBookmarks.itemLink, request.itemLink), inArray(mangaBookmarks.id, request.ids)));

        pingDatabaseChange("db:bookmark:change");
        return true;
    },
    "db:book:getBookmarks": async (db, request) => {
        return await db.db.select().from(bookBookmarks).where(eq(bookBookmarks.itemLink, request.itemLink));
    },
    "db:book:addBookmark": async (db, request) => {
        const data =
            (await db.db.insert(bookBookmarks).values(AddBookBookmarkSchema.parse(request)).returning())?.[0] ??
            null;
        if (data) pingDatabaseChange("db:bookmark:change");
        return data;
    },
    "db:book:deleteBookmarks": async (db, request) => {
        if (request.all) {
            await db.db.delete(bookBookmarks).where(eq(bookBookmarks.itemLink, request.itemLink));
            return true;
        }
        await db.db
            .delete(bookBookmarks)
            .where(and(eq(bookBookmarks.itemLink, request.itemLink), inArray(bookBookmarks.id, request.ids)));

        pingDatabaseChange("db:bookmark:change");
        return true;
    },
};
