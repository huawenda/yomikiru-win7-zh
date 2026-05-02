import { UpdateMangaProgressSchema } from "@electron/db/validator";
import { eq } from "drizzle-orm";
import { mangaProgress } from "../../db/schema";
import { pingDatabaseChange } from "../broadcast";
import type { DatabaseHandlers } from "./types";

type MangaChannel =
    | "db:manga:getProgress"
    | "db:manga:updateProgress"
    | "db:manga:updateChaptersRead"
    | "db:manga:updateChaptersReadAll";

export const mangaHandlers: DatabaseHandlers<MangaChannel> = {
    "db:manga:getProgress": async (db, request) => {
        const [progress] = await db.db
            .select()
            .from(mangaProgress)
            .where(eq(mangaProgress.itemLink, request.itemLink));
        pingDatabaseChange("db:library:change");
        return progress ?? null;
    },
    "db:manga:updateProgress": async (db, request) => {
        const data = (await db.updateMangaProgress(UpdateMangaProgressSchema.parse(request)))?.[0] ?? null;
        pingDatabaseChange("db:library:change");
        return data;
    },
    "db:manga:updateChaptersRead": async (db, request) => {
        const data = await db.updateMangaChapterRead(request.itemLink, [request.chapterName], request.read);
        pingDatabaseChange("db:library:change");
        return data;
    },
    "db:manga:updateChaptersReadAll": async (db, request) => {
        const data = await db.updateMangaChapterRead(request.itemLink, request.chapters, request.read);
        pingDatabaseChange("db:library:change");
        return data;
    },
};
