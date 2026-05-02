import { UpdateBookProgressSchema } from "@electron/db/validator";
import { eq } from "drizzle-orm";
import { bookProgress } from "../../db/schema";
import { pingDatabaseChange } from "../broadcast";
import type { DatabaseHandlers } from "./types";

type BookChannel = "db:book:getProgress" | "db:book:updateProgress";

export const bookHandlers: DatabaseHandlers<BookChannel> = {
    "db:book:getProgress": async (db, request) => {
        const [item] = await db.db.select().from(bookProgress).where(eq(bookProgress.itemLink, request.itemLink));
        return item ?? null;
    },
    "db:book:updateProgress": async (db, request) => {
        const data = (await db.updateBookProgress(UpdateBookProgressSchema.parse(request)))?.[0];
        pingDatabaseChange("db:library:change");
        return data;
    },
};
