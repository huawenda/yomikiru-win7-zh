import { makeNewSettings, setAppSettings, setEpubReaderSettings, setReaderSettings } from "@store/appSettings";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { resetLibrary } from "@store/library";
import { updateMainSettings } from "@store/mainSettings";
import { resetShortcuts } from "@store/shortcuts";
import { resetAllTheme } from "@store/themes";
import InputCheckbox from "@ui/InputCheckbox";
import { dialogUtils } from "@utils/dialog";
import { promptSelectDir } from "@utils/file";
import { useSettingsContext } from "../Settings";
import AnilistSetting from "./AnilistSetting";
import CustomTempLocation from "./CustomTempLocation";
import FileExplorerOptions from "./FileExplorerOptions";
import GeneralPDFSettings from "./GeneralPDFSettings";
import GeneralReaderPresetsSettings from "./GeneralReaderPresetsSettings";
import GeneralThemeSettings from "./GeneralThemeSettings";

const GeneralSettings: React.FC = () => {
    const { scrollIntoView } = useSettingsContext();
    const appSettings = useAppSelector((store) => store.appSettings);
    const mainSettings = useAppSelector((store) => store.mainSettings);
    const dispatch = useAppDispatch();

    return (
        <div className="content2">
            <div className="settingItem2">
                <h3>默认位置</h3>
                {/* <div className="desc">
                                    Default location of home screen Locations tab. Set this to folder where you
                                    store your manga.
                                </div> */}
                <div className="main row">
                    <input type="text" value={appSettings.baseDir} readOnly />
                    <button
                        onClick={() => {
                            promptSelectDir((path) => dispatch(setAppSettings({ baseDir: path as string })));
                        }}
                    >
                        更改默认位置
                    </button>
                </div>
            </div>
            <GeneralThemeSettings />
            <GeneralReaderPresetsSettings />
            {process.platform === "win32" && <FileExplorerOptions />}
            <AnilistSetting />
            <GeneralPDFSettings />
            <div className="settingItem2" id="settings-customStylesheet">
                <h3>自定义样式表</h3>
                <div className="desc">
                    可以加载自定义 CSS 样式表，以实现主题之外的界面样式调整。{" "}
                    <a
                        onClick={() => {
                            scrollIntoView("#settings-usage-customStylesheet", "extras");
                        }}
                    >
                        更多信息
                    </a>
                </div>
                <div className="main row">
                    <input
                        type="text"
                        placeholder="未选择文件"
                        value={appSettings.customStylesheet}
                        readOnly
                    />
                    <button
                        onClick={() => {
                            promptSelectDir(
                                (path) => {
                                    dispatch(setAppSettings({ customStylesheet: path as string }));
                                },
                                true,
                                [
                                    {
                                        extensions: ["css"],
                                        name: "Cascading Style Sheets",
                                    },
                                ],
                            );
                        }}
                    >
                        选择
                    </button>
                    <button
                        onClick={() => {
                            dispatch(setAppSettings({ customStylesheet: "" }));
                        }}
                    >
                        清除
                    </button>
                </div>
            </div>
            <CustomTempLocation />
            <div className="settingItem2 otherSettings" id="settings-otherSettings">
                <h3>其他设置</h3>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={mainSettings.hardwareAcceleration}
                        className="noBG"
                        onChange={async (e) => {
                            dispatch(updateMainSettings({ hardwareAcceleration: e.currentTarget.checked }));
                        }}
                        labelAfter="硬件加速"
                    />
                    <div className="desc">
                        使用 GPU 加速渲染，减少阅读器卡顿。 <code>需要重启应用</code>
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={mainSettings.askBeforeClosing}
                        className="noBG"
                        onChange={async (e) => {
                            dispatch(updateMainSettings({ askBeforeClosing: e.currentTarget.checked }));
                        }}
                        labelAfter="关闭窗口前确认"
                    />
                    <div className="desc">关闭窗口前弹出确认。</div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={mainSettings.minimizeToTray}
                        className="noBG"
                        onChange={async (e) => {
                            dispatch(updateMainSettings({ minimizeToTray: e.currentTarget.checked }));
                        }}
                        labelAfter="最小化到托盘"
                    />
                    <div className="desc">
                        启用后，最小化会将窗口发送到系统托盘而不是任务栏。单窗口时左键托盘图标切换显示/隐藏；多窗口时左键还原或聚焦。右键可查看窗口列表、隐藏所有窗口和退出。
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={mainSettings.openInExistingWindow}
                        className="noBG"
                        onChange={async (e) => {
                            dispatch(updateMainSettings({ openInExistingWindow: e.currentTarget.checked }));
                        }}
                        labelAfter="使用现有窗口"
                    />
                    <div className="desc">
                        再次启动应用时，在当前窗口打开文件并聚焦。关闭后会在新窗口打开。<code>需要重启应用</code>
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.openOnDblClick}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(setAppSettings({ openOnDblClick: e.currentTarget.checked }));
                        }}
                        labelAfter="双击打开"
                    />
                    <div className="desc">在主页位置列表中双击项目时，用阅读器打开。</div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.syncSettings}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(setAppSettings({ syncSettings: e.currentTarget.checked }));
                        }}
                        labelAfter="同步设置"
                    />
                    <div className="desc">
                        在所有已打开窗口之间同步应用设置。<code>需要重启应用</code>
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.syncThemes}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(setAppSettings({ syncThemes: e.currentTarget.checked }));
                        }}
                        labelAfter="同步主题"
                    />
                    <div className="desc">
                        在所有已打开窗口之间同步主题。<code>需要重启应用</code>
                    </div>
                </div>
                <div className="toggleItem" id="settings-openDirectlyFromManga">
                    <InputCheckbox
                        checked={appSettings.openDirectlyFromManga}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    openDirectlyFromManga: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="章节打开快捷方式"
                    />
                    <div className="desc">
                        如果章节文件夹位于默认位置下的漫画文件夹内，点击名称即可直接打开章节，不必点击阅读器中的箭头。{" "}
                        <a
                            onClick={() => {
                                scrollIntoView("#settings-usage-openDirectlyFromManga", "extras");
                            }}
                        >
                            更多信息
                        </a>
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.showSearch}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(setAppSettings({ showSearch: e.currentTarget.checked }));
                        }}
                        labelAfter="书签/历史搜索"
                    />
                    <div className="desc">在书签和历史列表上方显示搜索栏。</div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.confirmDeleteItem}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    confirmDeleteItem: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="删除侧边列表项目前确认"
                    />
                    <div className="desc">
                        从侧边列表删除历史、书签或笔记前进行确认。
                        <br />
                        主页中始终启用。
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.openInZenMode}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(setAppSettings({ openInZenMode: e.currentTarget.checked }));
                        }}
                        labelAfter="自动 Zen Mode"
                    />
                    <div className="desc">
                        默认以 &quot;Zen Mode&quot; 打开阅读器。从文件资源管理器打开时同样生效。
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.hideCursorInZenMode}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    hideCursorInZenMode: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="Zen Mode 光标"
                    />
                    <div className="desc">在 Zen Mode 中隐藏光标。</div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.autoRefreshSideList}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    autoRefreshSideList: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="自动刷新侧边列表"
                    />
                    <div className="desc">
                        检测到文件变化时自动刷新阅读器侧边列表。如果存储较慢且章节/页数较多，可能会比较耗时。
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.useCanvasBasedReader}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    useCanvasBasedReader: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="Canvas 渲染"
                    />
                    <div className="desc">
                        阅读高分辨率图片时让滚动更平滑，并减少卡顿。
                        <br />
                        缺点：RAM 占用较高；尺寸设置较低时图片清晰度会下降。<code>实验性</code>
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.readerSettings.dynamicLoading}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setReaderSettings({
                                    dynamicLoading: e.currentTarget.checked,
                                }),
                            );
                        }}
                        disabled={appSettings.useCanvasBasedReader}
                        labelAfter="动态图片加载"
                    />
                    <div className="desc">
                        移除初始加载界面，并在滚动时加载图片。不适用于
                        &quot;Canvas Based Rendering&quot;
                        <br />
                        缺点：滚动尺寸可能不稳定，不支持跨页图片，滚动时可能卡顿。
                    </div>
                </div>

                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.readerSettings.focusChapterInList}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setReaderSettings({
                                    focusChapterInList: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="自动聚焦侧边列表中的当前章节"
                    />
                    <div className="desc">
                        切换章节时自动聚焦/滚动到侧边列表中的当前章节。对于章节数量很多（&gt; 500）的 EPUB，可能造成明显性能损耗。
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.epubReaderSettings.focusChapterInList}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setEpubReaderSettings({
                                    focusChapterInList: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="EPUB：自动聚焦侧边列表中的当前章节"
                    />
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.epubReaderSettings.loadOneChapter}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setEpubReaderSettings({
                                    loadOneChapter: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="EPUB：按章节加载"
                    />
                    <div className="desc">
                        每次只加载并显示一个章节（来自 TOC）。关闭后会显示整个 EPUB 文件（RAM 占用较高）。
                        <br />
                        缺点：TOC 之外的内容将无法访问。
                    </div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={!appSettings.epubReaderSettings.textSelect}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setEpubReaderSettings({
                                    textSelect: !e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="EPUB：禁用文本选择 / 启用双击 Zen Mode"
                    />
                    <div className="desc">
                        禁用 EPUB 阅读器中的文本选择，并启用双击进入 Zen Mode。
                    </div>
                </div>
            </div>

            <div className="settingItem2 otherSettings">
                <h3>样式设置</h3>

                <div className="toggleItem">
                    <InputCheckbox
                        checked={!appSettings.disableListNumbering}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    disableListNumbering: !e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="位置列表编号"
                    />
                    <div className="desc">启用位置列表编号。此设置会应用到所有列表。</div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={!appSettings.readerSettings.disableChapterTransitionScreen}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setReaderSettings({
                                    disableChapterTransitionScreen: !e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="章节过渡画面"
                    />
                    <div className="desc">
                        显示章节开头和结尾处的章节过渡画面（仅在纵向滚动阅读模式中生效）。
                    </div>
                </div>

                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.showMoreDataOnItemHover}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    showMoreDataOnItemHover: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="悬停书签/历史时显示更多信息"
                    />
                    <div className="desc">
                        鼠标悬停在书签/历史项目上时，显示日期、总页数、上次页码、路径等更多信息。
                    </div>
                </div>

                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.checkboxReaderSetting}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    checkboxReaderSetting: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="阅读器设置使用复选框"
                    />
                    <div className="desc">在阅读器设置中使用复选框而不是开关。</div>
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.showPageCountInSideList}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    showPageCountInSideList: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="在侧边列表显示页数"
                    />
                </div>
                <div className="toggleItem">
                    <InputCheckbox
                        checked={appSettings.showTextFileBadge}
                        className="noBG"
                        onChange={(e) => {
                            dispatch(
                                setAppSettings({
                                    showTextFileBadge: e.currentTarget.checked,
                                }),
                            );
                        }}
                        labelAfter="在侧边列表显示文本文件标记"
                    />
                </div>
            </div>
            <div className="settingItem2 dangerZone">
                <h3>重置</h3>
                <div className="main row">
                    <button
                        onClick={() => {
                            dialogUtils
                                .warn({
                                    title: "重置书库",
                                    message:
                                        "这会删除书库中的所有条目，包括书签。是否继续？",
                                    noOption: false,
                                    defaultId: 0,
                                })
                                .then(({ response }) => {
                                    if (response === undefined) return;
                                    if (response === 1) return;
                                    if (response === 0) {
                                        dialogUtils
                                            .warn({
                                                title: "重置书库",
                                                message:
                                                    "这会删除书库中的所有条目，包括书签。是否继续？",
                                                noOption: false,
                                                buttons: ["取消", "重置"],
                                                defaultId: 0,
                                            })
                                            .then(({ response }) => {
                                                if (!response) return;
                                                dispatch(resetLibrary());
                                            });
                                    }
                                });
                        }}
                    >
                        重置书库
                    </button>
                    <button
                        onClick={() => {
                            dialogUtils
                                .warn({
                                    title: "重置主题",
                                    message: "这会删除所有主题。是否继续？",
                                    noOption: false,
                                })
                                .then(({ response }) => {
                                    if (response === undefined) return;
                                    if (response === 1) return;
                                    if (response === 0) {
                                        dialogUtils
                                            .warn({
                                                title: "重置主题",
                                                noOption: false,
                                                message:
                                                    "确定要删除所有主题吗？\n此操作不可撤销。",
                                            })
                                            .then((res) => {
                                                if (res.response === 1) return;
                                                dispatch(resetAllTheme());
                                            });
                                    }
                                });
                        }}
                    >
                        重置主题
                    </button>
                    <button
                        onClick={() => {
                            dialogUtils
                                .warn({
                                    title: "警告",
                                    message: "将快捷键重置为默认值？",
                                    noOption: false,
                                })
                                .then((res) => {
                                    if (res.response === 0) {
                                        dispatch(resetShortcuts());
                                    }
                                });
                        }}
                    >
                        重置快捷键
                    </button>
                    <button
                        onClick={() => {
                            dialogUtils
                                .warn({
                                    title: "重置设置",
                                    message: "这会重置所有设置。是否继续？",
                                    noOption: false,
                                })
                                .then(({ response }) => {
                                    if (response === undefined) return;
                                    if (response === 1) return;
                                    if (response === 0) {
                                        dialogUtils
                                            .warn({
                                                title: "重置设置",
                                                noOption: false,
                                                message:
                                                    "确定要重置设置吗？\n此操作不可撤销。",
                                            })
                                            .then((res) => {
                                                if (res.response === 1) return;
                                                dispatch(makeNewSettings());
                                                dispatch(resetShortcuts());
                                            });
                                    }
                                });
                        }}
                    >
                        重置设置
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
