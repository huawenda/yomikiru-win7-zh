import type { ReactElement } from "react";
import { useExplorerOptions } from "../hooks/useExplorerOptions";

const FileExplorerOptions = (): ReactElement => {
    const { isUpdating, handleInvoke } = useExplorerOptions();

    const handleAddOption = () => {
        handleInvoke("explorer:addOption", "已成功为漫画/图片文件添加文件资源管理器选项");
    };

    const handleRemoveOption = () => {
        handleInvoke("explorer:removeOption", "已成功移除漫画/图片文件的文件资源管理器选项");
    };

    const handleAddEpubOption = () => {
        handleInvoke("explorer:addOption:epub", "已成功为 EPUB/文本文件添加文件资源管理器选项");
    };

    const handleRemoveEpubOption = () => {
        handleInvoke("explorer:removeOption:epub", "已成功移除 EPUB/文本文件的文件资源管理器选项");
    };

    return (
        <div className="settingItem2" id="settings-fileExplorerOption">
            <h3>文件资源管理器选项</h3>
            <div className="desc">
                添加文件资源管理器选项（右键菜单），可直接从文件资源管理器中用 Yomikiru 阅读器打开项目。若要在当前窗口打开，请在其他设置中启用“使用现有窗口”。
            </div>
            <ul>
                <li>
                    <div className="desc">
                        用于文件夹、<code>.zip/.cbz</code>、<code>.7z/.cb7</code>、<code>.rar/.cbr</code>、{" "}
                        <code>.pdf</code>（在漫画/图片阅读器中打开）
                    </div>
                    <div className="main row">
                        <button onClick={handleAddOption} disabled={isUpdating}>
                            {"添加"}
                        </button>
                        <button onClick={handleRemoveOption} disabled={isUpdating}>
                            {"移除"}
                        </button>
                    </div>
                </li>
                <li>
                    <div className="desc">
                        用于 <code>.epub</code>、<code>.txt</code>、<code>.html/.xhtml</code>（在 EPUB/文本阅读器中打开）
                    </div>
                    <div className="main row">
                        <button onClick={handleAddEpubOption} disabled={isUpdating}>
                            {"添加"}
                        </button>
                        <button onClick={handleRemoveEpubOption} disabled={isUpdating}>
                            {"移除"}
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default FileExplorerOptions;
