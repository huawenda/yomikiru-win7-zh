import type { DatabaseChannels } from "@common/types/ipc";
import { ipcClient } from "@shared/platform/ipcClient";

export const bookNoteApi = {
    getAll: () => ipcClient.invoke("db:book:getAllNotes"),
    add: (data: DatabaseChannels["db:book:addNote"]["request"]) => ipcClient.invoke("db:book:addNote", data),
    update: (data: DatabaseChannels["db:book:updateNote"]["request"]) =>
        ipcClient.invoke("db:book:updateNote", data),
    delete: (data: DatabaseChannels["db:book:deleteNotes"]["request"]) =>
        ipcClient.invoke("db:book:deleteNotes", data),
};
