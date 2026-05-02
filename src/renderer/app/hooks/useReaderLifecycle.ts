import { useAppDispatch } from "@store/hooks";
import { updateCurrentItemProgress } from "@store/library";
import { resetReaderState } from "@store/reader";
import { useCallback } from "react";
import { createRendererLogger } from "../../utils/logger";

const log = createRendererLogger("App/readerLifecycle");

export const useReaderLifecycle = () => {
    const dispatch = useAppDispatch();

    const closeReader = useCallback(async () => {
        await dispatch(updateCurrentItemProgress());
        dispatch(resetReaderState());

        // This is async, so capture the temp dir before state changes elsewhere.
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
    }, [dispatch]);

    const openInNewWindow = useCallback((link: string) => {
        // New window will be opened; if link is invalid then it will be forced closed.
        link &&
            window.fs.access(link).then(() => {
                window.electron.send("window:openLinkInNewWindow", link);
            });
    }, []);

    return { closeReader, openInNewWindow };
};
