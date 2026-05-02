import { useAppDispatch, useAppSelector } from "@store/hooks";
import { getShortcutsMapped } from "@store/shortcuts";
import { toggleSettingsOpen } from "@store/ui";
import { keyFormatter, mouseEventFormatter } from "@utils/keybindings";
import { useEffect } from "react";
import { shallowEqual } from "react-redux";

export const useGlobalShortcuts = ({
    closeReader,
    isReaderOpen,
}: {
    closeReader: () => Promise<void>;
    isReaderOpen: boolean;
}) => {
    const dispatch = useAppDispatch();
    const shortcutsMapped = useAppSelector(getShortcutsMapped, shallowEqual);

    useEffect(() => {
        const handleShortcut = (keyStr: string, e: Event) => {
            const i = (keys: string[]) => keys.includes(keyStr);
            const afterUIScale = () => {
                process.platform === "win32" &&
                    window.electron.currentWindow.setTitleBarOverlay()({
                        height: Math.floor(40 * window.electron.webFrame.getZoomFactor()),
                    });
                (document.querySelector(".windowBtnCont") as HTMLDivElement).style.right = `${
                    140 * (1 / window.electron.webFrame.getZoomFactor())
                }px`;
            };
            switch (true) {
                case i(shortcutsMapped.navToHome):
                    e.preventDefault();
                    if (window.electron.currentWindow.isFullScreen())
                        window.electron.currentWindow.setFullScreen(false);
                    if (isReaderOpen) return void closeReader();
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
    }, [closeReader, dispatch, isReaderOpen, shortcutsMapped]);
};
