import { AddBookNoteSchema } from "@electron/db/validator";
import { and, eq, inArray } from "drizzle-orm";
import { bookNotes } from "../../db/schema";
import { pingDatabaseChange } from "../broadcast";
import type { DatabaseHandlers } from "./types";

type NoteChannel =
    | "db:book:getAllNotes"
    | "db:book:getNotes"
    | "db:book:addNote"
    | "db:book:updateNote"
    | "db:book:deleteNotes";

export const noteHandlers: DatabaseHandlers<NoteChannel> = {
    "db:book:getAllNotes": async (db) => {
        return (await db.db.select().from(bookNotes)) || [];
    },
    "db:book:getNotes": async (db, request) => {
        return await db.db.select().from(bookNotes).where(eq(bookNotes.itemLink, request.itemLink));
    },
    "db:book:addNote": async (db, request) => {
        const data =
            (await db.db.insert(bookNotes).values(AddBookNoteSchema.parse(request)).returning())?.[0] ?? null;
        pingDatabaseChange("db:bookNote:change");
        return data;
    },
    "db:book:updateNote": async (db, request) => {
        const data = await db.db
            .update(bookNotes)
            .set({ content: request.content, color: request.color })
            .where(eq(bookNotes.id, request.id))
            .returning();
        pingDatabaseChange("db:bookNote:change");
        return data?.[0] ?? null;
    },
    "db:book:deleteNotes": async (db, request) => {
        if (request.all) {
            await db.db.delete(bookNotes).where(eq(bookNotes.itemLink, request.itemLink));
            return true;
        }
        await db.db
            .delete(bookNotes)
            .where(and(eq(bookNotes.itemLink, request.itemLink), inArray(bookNotes.id, request.ids)));
        pingDatabaseChange("db:bookNote:change");
        return true;
    },
};
