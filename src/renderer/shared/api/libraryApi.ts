import type { DatabaseChannels } from "@common/types/ipc";
import { ipcClient } from "@shared/platform/ipcClient";

export const libraryApi = {
    getAllItemsWithProgress: () => ipcClient.invoke("db:library:getAllAndProgress"),
    addItem: (data: DatabaseChannels["db:library:addItem"]["request"]) =>
        ipcClient.invoke("db:library:addItem", data),
    updateMangaProgress: (data: DatabaseChannels["db:manga:updateProgress"]["request"]) =>
        ipcClient.invoke("db:manga:updateProgress", data),
    updateBookProgress: (data: DatabaseChannels["db:book:updateProgress"]["request"]) =>
        ipcClient.invoke("db:book:updateProgress", data),
    deleteItem: (data: DatabaseChannels["db:library:deleteItem"]["request"]) =>
        ipcClient.invoke("db:library:deleteItem", data),
    reset: () => ipcClient.invoke("db:library:reset"),
    updateMangaChaptersRead: (data: DatabaseChannels["db:manga:updateChaptersRead"]["request"]) =>
        ipcClient.invoke("db:manga:updateChaptersRead", data),
    updateMangaChaptersReadAll: (data: DatabaseChannels["db:manga:updateChaptersReadAll"]["request"]) =>
        ipcClient.invoke("db:manga:updateChaptersReadAll", data),
};
