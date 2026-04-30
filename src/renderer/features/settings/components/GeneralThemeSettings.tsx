import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { addThemes, deleteTheme, newTheme, setTheme } from "@store/themes";
import { dialogUtils } from "@utils/dialog";
import { createRendererLogger } from "@utils/logger";
import { initThemeData } from "@utils/theme";
import { useSettingsContext } from "../Settings";

const log = createRendererLogger("settings/GeneralThemeSettings");

import { TAB_INFO } from "../utils/constants";

const GeneralThemeSettings: React.FC = () => {
    const { scrollIntoView, setCurrentTab } = useSettingsContext();
    const theme = useAppSelector((store) => store.theme.name);
    const allThemes = useAppSelector((store) => store.theme.allData);
    const dispatch = useAppDispatch();
    return (
        <div className="settingItem2" id="settings-theme">
            <h3>主题</h3>
            <div className="main row">
                {allThemes.map((e) => (
                    <div className="themeButtons" key={e.name}>
                        <button
                            className={`${theme === e.name ? "selected" : ""} ${
                                initThemeData.allData.map((e) => e.name).includes(e.name) ? "default" : ""
                            }`}
                            onClick={() => dispatch(setTheme(e.name))}
                            title={e.name}
                        >
                            {e.name}
                        </button>
                    </div>
                ))}
                <div className="row">
                    <button
                        onClick={() => {
                            setCurrentTab(TAB_INFO.makeTheme[0]);
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} /> <span className="icon">/</span>{" "}
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {!initThemeData.allData.map((q) => q.name).includes(theme) && (
                        <button
                            onClick={() => {
                                dialogUtils
                                    .confirm({
                                        message: `删除主题 "${theme}"？`,
                                        noOption: false,
                                    })
                                    .then((res) => {
                                        if (res.response === 0) {
                                            const themeIndex = allThemes.findIndex((e) => e.name === theme);
                                            if (themeIndex > -1 && allThemes[themeIndex - 1]) {
                                                dispatch(setTheme(allThemes[themeIndex - 1].name));
                                                dispatch(deleteTheme(themeIndex));
                                            }
                                        }
                                    });
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    )}
                </div>
            </div>
            <hr className="mini" />
            <div className=" col">
                <div className="main row">
                    <button
                        onClick={async () => {
                            const opt = await dialogUtils.showSaveDialog({
                                title: "导出主题",
                                defaultPath: "yomikiru-themes.json",
                                filters: [
                                    {
                                        name: "json",
                                        extensions: ["json"],
                                    },
                                ],
                            });
                            if (!opt.filePath) return;
                            const themeForExport = allThemes.filter(
                                (e) => !initThemeData.allData.map((e) => e.name).includes(e.name),
                            );
                            window.electron.invoke("fs:saveFile", {
                                filePath: opt.filePath,
                                data: JSON.stringify(themeForExport, null, "\t"),
                            });
                        }}
                    >
                        导出
                    </button>
                    <button
                        onClick={async () => {
                            const opt = await dialogUtils.showOpenDialog({
                                properties: ["openFile"],
                                filters: [
                                    {
                                        name: "Json",
                                        extensions: ["json"],
                                    },
                                ],
                            });
                            if (!opt.filePaths.length) return;
                            const data: ThemeData[] | Themes = JSON.parse(
                                await window.fs.readFile(opt.filePaths[0], "utf8"),
                            );
                            const dataToAdd: ThemeData[] = [];
                            let importedCount = 0;
                            const existingThemeNames = allThemes.map((e) => e.name);
                            if (!Array.isArray(data)) {
                                if ("name" in data && "allData" in data) {
                                    data.allData.forEach((e, i) => {
                                        if ("name" in e && "main" in e) {
                                            if (
                                                existingThemeNames.includes(e.name) ||
                                                dataToAdd.map((a) => a.name).includes(e.name)
                                            ) {
                                                dialogUtils.warn({
                                                    message:
                                                        "检测到同名主题，不会导入。\n名称：" +
                                                        e.name,
                                                });
                                            } else {
                                                dataToAdd.push(e);
                                                importedCount++;
                                            }
                                        } else log.warn(`Theme import: skipped invalid row at index ${i}`);
                                    });
                                } else {
                                    dialogUtils.customError({
                                        message: "数据格式不正确。",
                                        log: false,
                                    });
                                    return;
                                }
                            } else
                                data.forEach((e, i) => {
                                    if ("name" in e && "main" in e) {
                                        if (
                                            existingThemeNames.includes(e.name) ||
                                            dataToAdd.map((a) => a.name).includes(e.name)
                                        ) {
                                            dialogUtils.warn({
                                                message: `检测到同名主题，不会导入。\n名称：${e.name}`,
                                            });
                                        } else {
                                            dataToAdd.push(e);
                                            importedCount++;
                                        }
                                    } else log.warn(`Theme import: skipped invalid row at index ${i}`);
                                });
                            dialogUtils.confirm({
                                title: "已导入",
                                message: `已导入 ${importedCount} 个主题。`,
                                noOption: true,
                            });
                            dispatch(addThemes(dataToAdd));
                        }}
                    >
                        导入
                    </button>
                    <button
                        onClick={() =>
                            window.electron.openExternal("https://github.com/mienaiyami/yomikiru/discussions/191")
                        }
                    >
                        分享主题 / 获取更多主题
                    </button>
                </div>
                <div className="desc">
                    轻松分享你的自定义主题。{" "}
                    <a
                        onClick={() => {
                            scrollIntoView("#settings-usage-copyTheme", "extras");
                        }}
                        id="settings-copyTheme"
                    >
                        更多信息。
                    </a>
                </div>
                <div className="main row">
                    <button
                        onClick={() => {
                            const theme = window.electron.readText("clipboard");
                            if (theme) {
                                try {
                                    const themeJSON = JSON.parse(theme);
                                    if (themeJSON) {
                                        if ("name" in themeJSON && "main" in themeJSON) {
                                            if (allThemes.map((e) => e.name).includes(themeJSON.name)) {
                                                dialogUtils.warn({
                                                    message:
                                                        "检测到同名主题，不会导入。\n名称：" +
                                                        themeJSON.name,
                                                });
                                            } else {
                                                dispatch(newTheme(themeJSON));
                                            }
                                        } else
                                            dialogUtils.customError({
                                                title: "失败",
                                                message: `主题数据无效。请注意，数据必须类似“复制当前主题到剪贴板”的结果。`,
                                            });
                                    }
                                } catch (reason) {
                                    log.error("Theme import: file read or parse failed", reason);
                                    dialogUtils.customError({
                                        title: "失败",
                                        message: `主题数据无效。请注意，数据必须类似“复制当前主题到剪贴板”的结果。`,
                                    });
                                }
                            }
                        }}
                    >
                        从剪贴板保存主题
                    </button>
                    <button
                        onClick={(e) => {
                            const currentTheme = allThemes.find((e) => e.name === theme);
                            if (currentTheme) {
                                try {
                                    window.electron.writeText(JSON.stringify(currentTheme, null, "\t"));
                                    const target = e.currentTarget;
                                    const oldText = target.innerText;
                                    target.innerText = `${"\u00a0".repeat(23)}已复制${"\u00a0".repeat(23)}`;
                                    target.disabled = true;
                                    setTimeout(() => {
                                        target.disabled = false;
                                        target.innerText = oldText;
                                    }, 3000);
                                } catch (reason) {
                                    dialogUtils.customError({
                                        message: `复制主题失败：${reason}`,
                                    });
                                }
                            }
                        }}
                    >
                        复制当前主题到剪贴板
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralThemeSettings;
