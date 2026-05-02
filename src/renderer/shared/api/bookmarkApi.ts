import type { DatabaseChannels } from "@common/types/ipc";
import { ipcClient } from "@shared/platform/ipcClient";

export const bookmarkApi = {
    getAll: () => ipcClient.invoke("db:library:getAllBookmarks"),
    addManga: (data: DatabaseChannels["db:manga:addBookmark"]["request"]) =>
        ipcClient.invoke("db:manga:addBookmark", data),
    addBook: (data: DatabaseChannels["db:book:addBookmark"]["request"]) =>
        ipcClient.invoke("db:book:addBookmark", data),
    deleteManga: (data: DatabaseChannels["db:manga:deleteBookmarks"]["request"]) =>
        ipcClient.invoke("db:manga:deleteBookmarks", data),
    deleteBook: (data: DatabaseChannels["db:book:deleteBookmarks"]["request"]) =>
        ipcClient.invoke("db:book:deleteBookmarks", data),
};
