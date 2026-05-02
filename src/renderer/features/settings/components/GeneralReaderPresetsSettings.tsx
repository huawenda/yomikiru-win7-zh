import { faChevronDown, faChevronUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
    addBookPresets,
    addMangaPresets,
    deleteReaderPresetWithFallback,
    movePreset,
    resetReaderPresetsToDefaults,
    selectReaderPreset,
} from "@store/readerPresets";
import { dialogUtils } from "@utils/dialog";
import { createRendererLogger } from "@utils/logger";
import type { BookReaderPreset, MangaReaderPreset } from "@utils/readerPresets";
import { isUserPresetId, parsePresetImport } from "@utils/readerPresets";

const log = createRendererLogger("settings/GeneralReaderPresetsSettings");

type PresetActionsRowProps = {
    type: "manga" | "book";
    title: string;
};

const PresetActionsRow = ({ type, title }: PresetActionsRowProps) => {
    const presets = useAppSelector((s) => s.readerPresets.presets.filter((p) => p.type === type));
    const currentPresetId = useAppSelector(
        (s) => s.appSettings[type === "manga" ? "mangaReaderPresetId" : "bookReaderPresetId"],
    );
    const dispatch = useAppDispatch();
    return (
        <div className="col">
            <h4>{title}预设</h4>
            <ul className="presetList">
                {presets.map((preset, idx) => {
                    const isSelected = currentPresetId === preset.id;
                    const canMoveUp = presets.length > 1 && idx > 0;
                    const canMoveDown = presets.length > 1 && idx < presets.length - 1;
                    return (
                        <li key={preset.id} className={`row presetItem ${isSelected ? "presetItemSelected" : ""}`}>
                            <span className="presetName" title={preset.name}>
                                {idx < 5 ? (
                                    <>
                                        <code>{idx + 1}</code>{" "}
                                    </>
                                ) : (
                                    ""
                                )}
                                {preset.name}
                            </span>
                            {presets.length > 1 && (
                                <>
                                    <button
                                        disabled={!canMoveUp}
                                        onClick={() => dispatch(movePreset({ id: preset.id, direction: "up" }))}
                                        title="上移"
                                    >
                                        <FontAwesomeIcon icon={faChevronUp} />
                                    </button>
                                    <button
                                        disabled={!canMoveDown}
                                        onClick={() => dispatch(movePreset({ id: preset.id, direction: "down" }))}
                                        title="下移"
                                    >
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => dispatch(selectReaderPreset(preset.id))}
                                className={isSelected ? "optionSelected" : ""}
                            >
                                选择
                            </button>
                            {presets.length > 1 && (
                                <button
                                    // added disable to prevent UI structure breaking
                                    disabled={isUserPresetId(preset.id)}
                                    onClick={() => {
                                        dialogUtils
                                            .confirm({ message: "删除预设？", noOption: false })
                                            .then((res) => {
                                                if (res.response === 0) {
                                                    dispatch(deleteReaderPresetWithFallback(preset.id));
                                                }
                                            });
                                    }}
                                    title="删除预设"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
            <div className="row">
                <button
                    onClick={async () => {
                        const opt = await dialogUtils.showSaveDialog({
                            title: `导出${title}预设`,
                            defaultPath: `yomikiru-${type}ReaderPresets.json`,
                            filters: [{ name: "json", extensions: ["json"] }],
                        });
                        if (!opt.filePath) return;
                        window.electron.invoke("fs:saveFile", {
                            filePath: opt.filePath,
                            data: JSON.stringify(presets, null, "\t"),
                        });
                    }}
                >
                    导出
                </button>
                <button
                    onClick={async () => {
                        const opt = await dialogUtils.showOpenDialog({
                            properties: ["openFile"],
                            filters: [{ name: "Json", extensions: ["json"] }],
                        });
                        if (!opt.filePaths.length) return;
                        try {
                            const raw = await window.fs.readFile(opt.filePaths[0], "utf8");
                            const data = JSON.parse(raw);
                            const validated = parsePresetImport(data).filter((p) => p.type === type);
                            const toAdd = validated.filter((p) => !presets.some((e) => e.id === p.id));
                            const skipped = validated.length - toAdd.length;
                            if (toAdd.length > 0) {
                                if (type === "manga") dispatch(addMangaPresets(toAdd as MangaReaderPreset[]));
                                else dispatch(addBookPresets(toAdd as BookReaderPreset[]));
                            }
                            dialogUtils.confirm({
                                title: "已导入",
                                message: `已导入 ${toAdd.length} 个预设。${skipped > 0 ? `已跳过 ${skipped} 个重复项。` : ""}`,
                                noOption: true,
                            });
                        } catch (err) {
                            log.error(err);
                            dialogUtils.customError({
                                message: "预设文件无效。",
                                log: false,
                            });
                        }
                    }}
                >
                    导入
                </button>
                <button
                    onClick={(e) => {
                        const current = currentPresetId ? presets.find((p) => p.id === currentPresetId) : null;
                        if (current) {
                            try {
                                window.electron.writeText(JSON.stringify(current, null, "\t"));
                                const target = e.currentTarget as HTMLButtonElement;
                                const old = target.innerText;
                                target.innerText = "已复制";
                                target.disabled = true;
                                setTimeout(() => {
                                    target.disabled = false;
                                    target.innerText = old;
                                }, 3000);
                            } catch (reason) {
                                dialogUtils.customError({ message: `复制失败：${reason}` });
                            }
                        } else {
                            dialogUtils.warn({
                                message: "未选择预设。请先应用一个预设，然后再复制。",
                            });
                        }
                    }}
                >
                    复制当前预设到剪贴板
                </button>
            </div>
        </div>
    );
};

/**
 * Reader presets: reset defaults, manga/book export/import/share.
 */
const GeneralReaderPresetsSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const presets = useAppSelector((s) => s.readerPresets.presets);

    const handleSavePresetFromClipboard = () => {
        const text = window.electron.readText("clipboard");
        try {
            if (!text) throw new Error("剪贴板中没有预设数据。");
            const parsed = JSON.parse(text) as unknown;
            const validated = parsePresetImport(Array.isArray(parsed) ? parsed : [parsed]);
            const p = validated[0];
            if (!p) throw new Error("格式无效");
            if (presets.some((e) => e.id === p.id)) {
                dialogUtils.warn({ message: "此 id 的预设已存在。" });
                return;
            }
            if (p.type === "manga") dispatch(addMangaPresets([p as MangaReaderPreset]));
            else dispatch(addBookPresets([p as BookReaderPreset]));
            dialogUtils.confirm({
                title: "已导入",
                message: `已导入预设 "${p.name}"。`,
                noOption: true,
            });
        } catch {
            dialogUtils.customError({
                message: "剪贴板中的预设数据无效。",
                log: false,
            });
        }
    };

    return (
        <div className="settingItem2" id="settings-reader-presets">
            <h3>阅读器预设</h3>
            <div className="desc">
                重置默认预设，或导出/导入/分享漫画和书籍阅读器预设。只处理自定义预设（导出时不包含默认预设）。
            </div>
            <div className="main col">
                <div className="row">
                    <button
                        onClick={() => {
                            dialogUtils
                                .confirm({
                                    message: "将默认预设重置为初始状态？自定义预设会保留。",
                                    noOption: false,
                                })
                                .then((res) => {
                                    if (res.response === 0) dispatch(resetReaderPresetsToDefaults());
                                });
                        }}
                    >
                        重置默认预设（不影响自定义预设）
                    </button>
                    <button onClick={handleSavePresetFromClipboard}>从剪贴板保存预设</button>
                </div>
                <PresetActionsRow type="manga" title="漫画" />
                <PresetActionsRow type="book" title="书籍" />
            </div>
        </div>
    );
};

export default GeneralReaderPresetsSettings;
