import type { useDirectoryValidator } from "@features/reader/hooks/useDirectoryValidator";
import { fetchAllBookmarks } from "@store/bookmarks";
import { fetchAllNotes } from "@store/bookNotes";
import { useAppDispatch } from "@store/hooks";
import { fetchAllItemsWithProgress } from "@store/library";
import { setMainSettings } from "@store/mainSettings";
import { useEffect, useLayoutEffect } from "react";

export const useAppIpcListeners = ({
    closeReader,
    isReaderOpen,
    openInReaderIfValid,
}: {
    closeReader: () => Promise<void>;
    isReaderOpen: boolean;
    openInReaderIfValid: ReturnType<typeof useDirectoryValidator>["openInReaderIfValid"];
}) => {
    const dispatch = useAppDispatch();

    useLayoutEffect(() => {
        if (window.app.deleteDirOnClose)
            window.electron.send("window:addDirToDelete", window.app.deleteDirOnClose);
    }, []);

    useEffect(() => {
        const listeners: (() => void)[] = [];
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
        if (window.electron.currentWindow.isFullScreen()) window.electron.currentWindow.setFullScreen(false);

        return () => {
            listeners.forEach((unsubscribe) => void unsubscribe());
        };
    }, [dispatch, openInReaderIfValid]);

    useEffect(() => {
        const listener = window.electron.on("reader:recordPage", async () => {
            if (isReaderOpen) await closeReader();
            window.electron.send("window:destroy");
        });
        return () => {
            listener();
        };
    }, [closeReader, isReaderOpen]);
};
