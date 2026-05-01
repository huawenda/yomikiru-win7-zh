import { useDirectoryValidator } from "@features/reader/hooks/useDirectoryValidator";
import { setAppSettings } from "@store/appSettings";
import { addBookmark, fetchAllBookmarks, removeBookmark } from "@store/bookmarks";
import { fetchAllNotes } from "@store/bookNotes";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
    deleteLibraryItem,
    fetchAllItemsWithProgress,
    updateChaptersRead,
    updateChaptersReadAll,
    updateCurrentItemProgress,
} from "@store/library";
import { getMainSettings, setMainSettings } from "@store/mainSettings";
import { resetReaderState } from "@store/reader";
import { getShortcutsMapped } from "@store/shortcuts";
import { setTheme } from "@store/themes";
import { toggleSettingsOpen } from "@store/ui";
import { dialogUtils } from "@utils/dialog";
import { keyFormatter, mouseEventFormatter } from "@utils/keybindings";
import {
    createContext,
    createRef,
    type ReactElement,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import { shallowEqual } from "react-redux";
import Main from "./Main";
import TopBar from "./TopBar";
import {
    formatUtils,
    promptSelectDir,
} from "./utils/file";
import { createRendererLogger } from "./utils/logger";

const log = createRendererLogger("App");

interface AppContext {
    pageNumberInputRef: React.RefObject<HTMLInputElement>;
    bookProgressRef: React.RefObject<HTMLInputElement>;
    /**
     * Check if folder have images then open those images in reader, or open in epub-reader if `.epub`
     * @param link link of folder containing images or epub file.
     */
    openInReader: ReturnType<typeof useDirectoryValidator>["openInReaderIfValid"];
    // addNewBookmark: (newBk: ChapterItem) => Promise<Electron.MessageBoxReturnValue> | undefined;
    closeReader: () => void;
    // updateLastHistoryPageNumber: () => void;
    openInNewWindow: (link: string) => void;
    contextMenuData: Menu.ContextMenuData | null;
    setContextMenuData: React.Dispatch<React.SetStateAction<Menu.ContextMenuData | null>>;
    optSelectData: Menu.OptSelectData | null;
    setOptSelectData: React.Dispatch<React.SetStateAction<Menu.OptSelectData | null>>;
    colorSelectData: Menu.ColorSelectData | null;
    setColorSelectData: React.Dispatch<React.SetStateAction<Menu.ColorSelectData | null>>;
    validateDirectory: ReturnType<typeof useDirectoryValidator>["validateDirectory"];
}

const AppContext = createContext<AppContext | null>(null);

export const useAppContext = (): AppContext => {
    const context = useContext(AppContext);
    if (!context) throw new Error("AppContext not found");
    return context;
};

const App = (): ReactElement => {
    const appSettings = useAppSelector((state) => state.appSettings);
    // const isReaderOpen = useAppSelector((state) => state.ui.isOpen.reader);
    const isReaderOpen = useAppSelector((state) => state.reader.active);
    const linkInReader = useAppSelector((state) => state.reader.link);
    const shortcutsMapped = useAppSelector(getShortcutsMapped, shallowEqual);
    const theme = useAppSelector((state) => state.theme.name);

    const pageNumberInputRef: React.RefObject<HTMLInputElement> = createRef();
    const bookProgressRef: React.RefObject<HTMLInputElement> = createRef();
    const [firstRendered, setFirstRendered] = useState(false);
    const [contextMenuData, setContextMenuData] = useState<Menu.ContextMenuData | null>(null);
    const [optSelectData, setOptSelectData] = useState<Menu.OptSelectData | null>(null);
    const [colorSelectData, setColorSelectData] = useState<Menu.ColorSelectData | null>(null);

    const dispatch = useAppDispatch();

    const { openInReaderIfValid, validateDirectory } = useDirectoryValidator();

    useEffect(() => {
        if (firstRendered) {
            if (appSettings.baseDir === "") {
                dialogUtils.customError({ message: "未找到设置，请选择漫画文件夹" });
                promptSelectDir((path) => dispatch(setAppSettings({ baseDir: path as string })));
            }
        } else {
            dispatch(setTheme(theme));
        }
    }, [firstRendered]);

    const closeReader = async () => {
        await dispatch(updateCurrentItemProgress());
        dispatch(resetReaderState());

        // this is needed coz it is async and by the time it executes, deleteDirOnClose changes to current dir
        const deleteDir = window.app.deleteDirOnClose;
        deleteDir &&
            window.fs
                .access(deleteDir)
                .then(() => {
                    window.fs.rm(deleteDir, { recursive: true }).catch((err) => {
                        log.error(`closeReader: could not delete temp dir "${deleteDir}"`, err);
                    });
                })
                .catch((err) => {
                    log.error(`closeReader: temp dir not accessible for delete "${deleteDir}"`, err);
                });

        document.body.classList.remove("zenMode");
        if (window.electron.currentWindow.isFullScreen()) window.electron.currentWindow.setFullScreen(false);
        setTimeout(() => {
            window.electron.webFrame.clearCache();
            window.electron.webFrame.clearCache();
        }, 1000);
    };

    const openInNewWindow = (link: string) => {
        // new window will be opened, if link is invalid then it will be forced closed.
        link &&
            window.fs.access(link).then(() => {
                window.electron.send("window:openLinkInNewWindow", link);
            });
    };

    useLayoutEffect(() => {
        if (window.app.deleteDirOnClose)
            window.electron.send("window:addDirToDelete", window.app.deleteDirOnClose);
    }, [window.app.deleteDirOnClose]);

    useEffect(() => {
        const listeners: (() => void)[] = [];
        setFirstRendered(true);
        dispatch(fetchAllItemsWithProgress());
        dispatch(fetchAllBookmarks());
        dispatch(fetchAllNotes());
        dispatch(getMainSettings());
        listeners.push(
            window.electron.on("reader:loadLink", ({ link }) => {
                if (link)
                    openInReaderIfValid(link, {
                        maxSubdirectoryDepth: 0,
                    }).then((isValid) => {
                        if (!isValid) {
                            window.electron.send("window:destroy");
                        }
                    });
            }),
        );
        // todo: these are temp only
        listeners.push(
            window.electron.on("db:library:change", () => {
                dispatch(fetchAllItemsWithProgress());
            }),
            window.electron.on("db:bookmark:change", () => {
                dispatch(fetchAllBookmarks());
            }),
            window.electron.on("db:bookNote:change", () => {
                dispatch(fetchAllNotes());
            }),
            window.electron.on("mainSettings:sync", (settings) => {
                dispatch(setMainSettings(settings));
            }),
        );

        listeners.push(
            window.electron.on("window:statusCheck", () => {
                window.electron.send("window:statusCheck:response");
            }),
        );

        window.app.titleBarHeight = parseFloat(
            window.getComputedStyle(document.body).getPropertyValue("--titleBar-height"),
        );
        // here bcoz reload doesnt make window exit fullscreen
        if (window.electron.currentWindow.isFullScreen()) window.electron.currentWindow.setFullScreen(false);

        return () => {
            listeners.forEach((e) => void e());
        };
    }, []);
    useEffect(() => {
        const listener = window.electron.on("reader:recordPage", async () => {
            if (isReaderOpen) await closeReader();
            window.electron.send("window:destroy");
        });
        return () => {
            listener();
        };
        // todo
    }, [isReaderOpen, closeReader]);

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
                        //todo
                        // else if (process.platform === "linux")
                        //     window.electron.send("showInExplorer", url);
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
                            dispatch(
                                deleteLibraryItem({
                                    link: url,
                                }),
                            );
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
                                    dispatch(
                                        deleteLibraryItem({
                                            link: url,
                                        }),
                                    );
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
                            dispatch(
                                removeBookmark({
                                    itemLink,
                                    ids: [bookmarkId],
                                    type,
                                }),
                            );
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
                                    dispatch(
                                        removeBookmark({
                                            itemLink,
                                            ids: [bookmarkId],
                                            type,
                                        }),
                                    );
                                });
                        }
                    },
                };
            },
            addToBookmark(args) {
                return {
                    label: "添加到书签",
                    // disabled: args ? false : true,
                    action() {
                        dispatch(addBookmark(args));
                    },
                };
            },
            unreadChapter(itemLink: string, chapterName: string) {
                return {
                    label: "标记为未读",
                    // todo check why i added these
                    // disabled: mangaIndex >= 0 && chapterIndex >= 0 ? false : true,
                    action() {
                        dispatch(
                            updateChaptersRead({
                                chapterName,
                                itemLink,
                                read: false,
                            }),
                        );
                    },
                };
            },
            readChapter(itemLink: string, chapterName: string) {
                return {
                    label: "标记为已读",
                    // disabled: mangaIndex >= 0 && chapter ? false : true,
                    action() {
                        dispatch(updateChaptersRead({ itemLink, chapterName, read: true }));
                    },
                };
            },
            readAllChapter(mangaIndex, chapters) {
                return {
                    label: "全部标记为已读",
                    // disabled: mangaIndex >= 0 && chapters.length > 0 ? false : true,
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
                    // disabled: mangaIndex >= 0 ? false : true,
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
    }, [appSettings, openInReaderIfValid]);

    useEffect(() => {
        const handleShortcut = (keyStr: string, e: Event) => {
            const i = (keys: string[]) => keys.includes(keyStr);
            const afterUIScale = () => {
                process.platform === "win32" &&
                    window.electron.currentWindow.setTitleBarOverlay()({
                        height: Math.floor(40 * window.electron.webFrame.getZoomFactor()),
                    });
                // page nav/ window btn cont width
                (document.querySelector(".windowBtnCont") as HTMLDivElement).style.right = `${
                    140 * (1 / window.electron.webFrame.getZoomFactor())
                }px`;
            };
            switch (true) {
                case i(shortcutsMapped.navToHome):
                    e.preventDefault();
                    if (window.electron.currentWindow.isFullScreen())
                        window.electron.currentWindow.setFullScreen(false);
                    if (isReaderOpen) return closeReader();
                    window.location.reload();
                    break;
                case i(shortcutsMapped.openSettings):
                    e.preventDefault();
                    dispatch(toggleSettingsOpen());
                    break;
                case i(shortcutsMapped.uiSizeReset):
                    e.preventDefault();
                    window.electron.webFrame.setZoomFactor(1);
                    afterUIScale();
                    break;
                case i(shortcutsMapped.uiSizeDown):
                    e.preventDefault();
                    window.electron.webFrame.setZoomFactor(window.electron.webFrame.getZoomFactor() - 0.1);
                    afterUIScale();
                    break;
                case i(shortcutsMapped.uiSizeUp):
                    e.preventDefault();
                    window.electron.webFrame.setZoomFactor(window.electron.webFrame.getZoomFactor() + 0.1);
                    afterUIScale();
                    break;
                default:
                    break;
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            const keyStr = keyFormatter(e);
            if (keyStr === "") return;
            handleShortcut(keyStr, e);
        };
        const onMouseDown = (e: MouseEvent) => {
            const keyStr = mouseEventFormatter(e);
            if (keyStr === "") return;
            handleShortcut(keyStr, e);
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("mousedown", onMouseDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("mousedown", onMouseDown);
        };
    }, [shortcutsMapped, isReaderOpen]);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        document.addEventListener("dragover", (e) => e.preventDefault(), { signal });
        document.addEventListener(
            "drop",
            async (e) => {
                e.preventDefault();
                try {
                    if (e.dataTransfer) {
                        const data = e.dataTransfer.files;
                        if (data.length > 0) {
                            if (!window.fs.existsSync(data[0].path)) return;
                            if (linkInReader === data[0].path) return;
                            if (data.length > 1)
                                dialogUtils.customError({
                                    message:
                                        "拖入了多个文件/文件夹。只会加载列表中的第一个。",
                                });
                            await window.fs.access(data[0].path);
                            if (window.fs.isDir(data[0].path)) {
                                await closeReader();
                                await openInReaderIfValid(data[0].path);
                            } else if (formatUtils.files.test(data[0].path)) {
                                await closeReader();
                                await openInReaderIfValid(data[0].path);
                            } else if (formatUtils.image.test(data[0].path.toLowerCase())) {
                                await closeReader();
                                await openInReaderIfValid(window.path.dirname(data[0].path));
                            }
                        }
                    }
                } catch (err) {
                    log.error("Drop handler: failed to open dropped path", err);
                    dialogUtils.customError({
                        message: "拖放文件时出错",
                        detail: err instanceof Error ? err.message : String(err),
                    });
                }
            },
            { signal },
        );
        return () => abortController.abort();
    }, [linkInReader]);

    // useLayoutEffect(() => {
    //     closeReader();
    // }, [appSettings.readerSettings.dynamicLoading]);

    return (
        <AppContext.Provider
            value={{
                pageNumberInputRef,
                bookProgressRef,
                openInReader: openInReaderIfValid,
                closeReader,
                openInNewWindow,
                validateDirectory,
                contextMenuData,
                setContextMenuData,
                optSelectData,
                setOptSelectData,
                colorSelectData,
                setColorSelectData,
            }}
        >
            <TopBar />
            <Main />
        </AppContext.Provider>
    );
};
export default App;
