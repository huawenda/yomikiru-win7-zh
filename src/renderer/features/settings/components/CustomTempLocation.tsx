import { setAppSettings } from "@store/appSettings";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { updateMainSettings } from "@store/mainSettings";
import InputCheckbox from "@ui/InputCheckbox";
import { dialogUtils } from "@utils/dialog";
import { promptSelectDir } from "@utils/file";
import { createRendererLogger } from "@utils/logger";

const log = createRendererLogger("settings/CustomTempLocation");

const CustomTempLocation: React.FC = () => {
    const dispatch = useAppDispatch();
    const appSettings = useAppSelector((state) => state.appSettings);
    const { tempPath } = useAppSelector((state) => state.mainSettings);

    const updateTempPath = async (newPath?: string) => {
        try {
            if (newPath === undefined || window.fs.existsSync(newPath)) {
                dispatch(updateMainSettings({ tempPath: newPath }));
            } else {
                throw new Error(`文件夹不存在：${newPath}`);
            }
        } catch (reason) {
            log.error("temp path update failed (IPC)", reason);
        }
    };

    return (
        <div className="settingItem2" id="settings-customTempFolder">
            <h3>自定义临时文件夹</h3>
            <div className="desc">
                应用会在此文件夹解压压缩包/EPUB 或渲染 PDF。根据硬盘类型（SSD、更快的硬盘）和剩余空间（建议
                10GB+），这里会明显影响解压速度。
                <br /> 默认使用操作系统提供的临时文件夹。
            </div>
            <div className="main row">
                <input type="text" placeholder="未选择路径" value={tempPath} readOnly />
                <button
                    onClick={() => {
                        promptSelectDir((path) => {
                            updateTempPath(path as string);
                        });
                    }}
                >
                    选择
                </button>
            </div>
            <div className="main row">
                <button
                    onClick={() => {
                        updateTempPath();
                    }}
                >
                    使用默认值
                </button>
                <button
                    onClick={async (e) => {
                        try {
                            const target = e.currentTarget;
                            target.disabled = true;
                            const res = await dialogUtils.confirm({
                                message: "清除所有已解压/已渲染文件？",
                                checkboxLabel: "同时清除应用缓存。",
                                buttons: ["是", "否"],
                                cancelId: 1,
                                defaultId: 1,
                                type: "question",
                            });

                            setTimeout(() => {
                                target.disabled = false;
                            }, 6000);
                            if (res.response === 0) {
                                if (res.checkboxChecked) {
                                    window.electron.clearAppCache();
                                }
                                const files = await window.fs.readdir(tempPath);
                                files
                                    .filter((e) => e.startsWith("yomikiru"))
                                    .forEach(
                                        (e) =>
                                            void window.fs.rm(window.path.join(tempPath, e), {
                                                force: true,
                                                recursive: true,
                                            }),
                                    );
                            }
                        } catch (err) {
                            log.error("cache folder delete failed", err);
                        }
                    }}
                >
                    删除所有文件缓存
                </button>
            </div>
            <div className="toggleItem" id="settings-keepExtractedFiles">
                <InputCheckbox
                    checked={appSettings.keepExtractedFiles}
                    className="noBG"
                    onChange={(e) => {
                        dispatch(
                            setAppSettings({
                                keepExtractedFiles: e.currentTarget.checked,
                            }),
                        );
                    }}
                    labelAfter="保留临时文件"
                />
                <div className="desc">
                    保留临时文件，主要包括已解压的压缩包、PDF 和 EPUB。再次打开同一标题时可跳过解压步骤。
                    <br />
                    注意：如果临时文件夹使用默认位置，系统可能会在每次开机后删除这些文件。
                </div>
            </div>
        </div>
    );
};

export default CustomTempLocation;
