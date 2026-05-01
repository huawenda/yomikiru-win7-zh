import { setReaderSettings } from "@store/appSettings";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { setReaderLoading } from "@store/reader";
import InputNumber from "@ui/InputNumber";
import { dialogUtils } from "@utils/dialog";
import { promptSelectDir } from "@utils/file";
import { createRendererLogger } from "@utils/logger";
import { renderPDF } from "@utils/pdf";
import { useSettingsContext } from "../Settings";

const log = createRendererLogger("settings/GeneralPDFSettings");

const GeneralPDFSettings: React.FC = () => {
    const { scrollIntoView } = useSettingsContext();
    const appSettings = useAppSelector((store) => store.appSettings);
    const dispatch = useAppDispatch();
    return (
        <div className="settingItem2" id="settings-pdfScale">
            <h3>PDF 选项</h3>
            <div className="desc">调整 PDF 渲染质量。数值越高，质量越高，但初次处理时 CPU 和存储占用也越高。</div>
            <div className="main row">
                <InputNumber
                    value={appSettings.readerSettings.pdfScale}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onChange={(e) => {
                        const value = e.valueAsNumber;
                        dispatch(setReaderSettings({ pdfScale: value }));
                    }}
                    labelBefore="缩放"
                    className="noBG"
                />
            </div>
            <div className="desc">
                将 PDF 渲染为 PNG 以加快加载速度。建议将{" "}
                <a
                    onClick={() => {
                        scrollIntoView("#settings-customTempFolder", "settings");
                    }}
                >
                    临时文件夹
                </a>{" "}
                设置为不会被操作系统自动清理的位置。<br />
                <a
                    onClick={() => {
                        scrollIntoView("#settings-keepExtractedFiles", "settings");
                    }}
                >
                    保留临时文件
                </a>{" "}
                必须启用后才能使用此功能。
            </div>
            <div className="main row">
                <button
                    disabled={!appSettings.keepExtractedFiles}
                    onClick={() => {
                        promptSelectDir(
                            (paths) => {
                                (async () => {
                                    if (!(Array.isArray(paths) && paths.length > 0)) return;
                                    // dispatch(setLoadingManga(true));
                                    // dispatch(setLoadingMangaPercent(0));
                                    for (let i = 0; i < paths.length; i++) {
                                        const path = paths[i];
                                        const linkSplitted = path.split(window.path.sep);
                                        dispatch(
                                            setReaderLoading({
                                                message: `[${i + 1}/${paths.length}] 正在渲染 "${linkSplitted
                                                    .at(-1)
                                                    ?.substring(0, 20)}..."`,
                                            }),
                                        );
                                        const renderPath = window.path.join(
                                            window.electron.app.getPath("temp"),
                                            `yomikiru-temp-images-scale_${
                                                appSettings.readerSettings.pdfScale
                                            }-${linkSplitted.at(-1)}`,
                                        );
                                        if (window.fs.existsSync(renderPath))
                                            await window.fs.rm(renderPath, {
                                                recursive: true,
                                            });
                                        await window.fs.mkdir(renderPath);
                                        log.log(`rendering -> "${renderPath}"`);
                                        try {
                                            await renderPDF(path, renderPath, appSettings.readerSettings.pdfScale);
                                        } catch (reason: unknown) {
                                            log.error(`render failed for "${path}"`, reason);
                                            if (reason instanceof Error && !reason.message.includes("password"))
                                                dialogUtils.customError({
                                                    message: "渲染 PDF 时出错",
                                                    detail: path,
                                                    log: false,
                                                });
                                        }
                                    }
                                    dialogUtils.confirm({
                                        message: "所有 PDF 已渲染完成",
                                    });
                                    dispatch(setReaderLoading(null));
                                })();
                            },
                            true,
                            [
                                {
                                    extensions: ["pdf"],
                                    name: "pdf",
                                },
                            ],
                            true,
                        );
                    }}
                >
                    选择要渲染的 PDF
                </button>
            </div>
        </div>
    );
};

export default GeneralPDFSettings;
