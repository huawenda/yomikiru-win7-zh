import type { useDirectoryValidator } from "@features/reader/hooks/useDirectoryValidator";
import { addBookmark, removeBookmark } from "@store/bookmarks";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { deleteLibraryItem, updateChaptersRead, updateChaptersReadAll } from "@store/library";
import { dialogUtils } from "@utils/dialog";
import { useEffect } from "react";

export const useContextMenuTemplate = ({
    openInNewWindow,
    openInReaderIfValid,
}: {
    openInNewWindow: (link: string) => void;
    openInReaderIfValid: ReturnType<typeof useDirectoryValidator>["openInReaderIfValid"];
}) => {
    const appSettings = useAppSelector((state) => state.appSettings);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // todo: use radix ui
        window.contextMenu.template = {
            divider() {
                return {
                    label: "",
                    action() {
                        //
                    },
                    divider: true,
                };
            },
            open(url) {
                return {
                    label: "打开",
                    disabled: !url,
                    action() {
                        openInReaderIfValid(url);
                    },
                };
            },
            openInNewWindow(url) {
                return {
                    label: "在新窗口中打开",
                    disabled: !url,
                    action() {
                        openInNewWindow(url);
                    },
                };
            },
            showInExplorer(url) {
                return {
                    label: "在文件资源管理器中显示",
                    disabled: !url,
                    action() {
                        if (process.platform === "win32") window.electron.showItemInFolder(url || "");
                    },
                };
            },
            copyPath(url) {
                return {
                    label: "复制路径",
                    disabled: !url,
                    action() {
                        window.electron.writeText(url);
                    },
                };
            },
            copyImage(url) {
                return {
                    label: "复制图片",
                    disabled: !url,
                    action() {
                        window.electron.copyImage(url.replace("file://", ""));
                    },
                };
            },
            removeHistory(url, isInSideList = false) {
                return {
                    label: "移除",
                    disabled: !url,
                    action() {
                        if (isInSideList && !appSettings.confirmDeleteItem) {
                            dispatch(deleteLibraryItem({ link: url }));
                        } else {
                            dialogUtils
                                .warn({
                                    title: "移除历史记录",
                                    message: "这也会移除所有相关书签。是否继续？",
                                    noOption: false,
                                    buttons: ["取消", "是"],
                                    defaultId: 0,
                                })
                                .then(({ response }) => {
                                    if (!response) return;
                                    dispatch(deleteLibraryItem({ link: url }));
                                });
                        }
                    },
                };
            },
            removeBookmark(itemLink, bookmarkId, type, isInSideList = false) {
                return {
                    label: "移除书签",
                    action() {
                        if (isInSideList && !appSettings.confirmDeleteItem) {
                            dispatch(removeBookmark({ itemLink, ids: [bookmarkId], type }));
                        } else {
                            dialogUtils
                                .warn({
                                    title: "移除书签",
                                    message: "只会移除此书签。是否继续？",
                                    noOption: false,
                                    buttons: ["取消", "是"],
                                    defaultId: 0,
                                })
                                .then(({ response }) => {
                                    if (!response) return;
                                    dispatch(removeBookmark({ itemLink, ids: [bookmarkId], type }));
                                });
                        }
                    },
                };
            },
            addToBookmark(args) {
                return {
                    label: "添加到书签",
                    action() {
                        dispatch(addBookmark(args));
                    },
                };
            },
            unreadChapter(itemLink: string, chapterName: string) {
                return {
                    label: "标记为未读",
                    action() {
                        dispatch(updateChaptersRead({ chapterName, itemLink, read: false }));
                    },
                };
            },
            readChapter(itemLink: string, chapterName: string) {
                return {
                    label: "标记为已读",
                    action() {
                        dispatch(updateChaptersRead({ itemLink, chapterName, read: true }));
                    },
                };
            },
            readAllChapter(mangaIndex, chapters) {
                return {
                    label: "全部标记为已读",
                    action() {
                        dialogUtils
                            .warn({
                                title: "全部标记为已读",
                                message: "这会将此漫画中的所有章节标记为已读。是否继续？",
                                noOption: false,
                                buttons: ["取消", "是"],
                                defaultId: 0,
                            })
                            .then(({ response }) => {
                                if (!response) return;
                                dispatch(updateChaptersReadAll({ itemLink: mangaIndex, chapters, read: true }));
                            });
                    },
                };
            },
            unreadAllChapter(mangaIndex) {
                return {
                    label: "全部标记为未读",
                    action() {
                        dialogUtils
                            .warn({
                                title: "全部标记为未读",
                                message: "这会从历史记录中移除此漫画的所有章节。是否继续？",
                                noOption: false,
                                buttons: ["取消", "是"],
                                defaultId: 0,
                            })
                            .then(({ response }) => {
                                if (!response) return;
                                dispatch(
                                    updateChaptersReadAll({ itemLink: mangaIndex, chapters: [], read: false }),
                                );
                            });
                    },
                };
            },
        };
    }, [appSettings, dispatch, openInNewWindow, openInReaderIfValid]);
};
