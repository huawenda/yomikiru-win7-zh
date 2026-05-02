import type { useDirectoryValidator } from "@features/reader/hooks/useDirectoryValidator";
import { dialogUtils } from "@utils/dialog";
import { formatUtils } from "@utils/file";
import { useEffect } from "react";
import { createRendererLogger } from "../../utils/logger";

const log = createRendererLogger("App/fileDropOpen");

export const useFileDropOpen = ({
    closeReader,
    linkInReader,
    openInReaderIfValid,
}: {
    closeReader: () => Promise<void>;
    linkInReader: string | null;
    openInReaderIfValid: ReturnType<typeof useDirectoryValidator>["openInReaderIfValid"];
}) => {
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
                                    message: "拖入了多个文件/文件夹。只会加载列表中的第一个。",
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
    }, [closeReader, linkInReader, openInReaderIfValid]);
};
