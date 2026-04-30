import { useAppSelector } from "@store/hooks";
import { Fragment } from "react";
import { useSettingsContext } from "../Settings";

const Usage: React.FC = () => {
    const { scrollIntoView } = useSettingsContext();
    const shortcuts = useAppSelector((store) => store.shortcuts);

    return (
        <div className="content2 features">
            <ul>
                <li>建议将“默认位置”设置为你平时存放漫画的文件夹。</li>
                <li>
                    <b>推荐文件结构：</b>虽然可以从任意位置打开漫画，但按下面的结构整理文件，可以让阅读器侧边列表等功能体验更好。
                    <ul className="fileExample">
                        <li>
                            默认位置\
                            <ul>
                                <li>
                                    One Piece\
                                    <ul>
                                        <li>
                                            Chapter 1\ <code>在这里使用“打开”</code>
                                            <ul>
                                                <li>001.png</li>
                                                <li>002.png</li>
                                                <li>003.png</li>
                                                <li>004.png</li>
                                            </ul>
                                        </li>
                                        <li>
                                            Chapter 2\
                                            <ul>
                                                <li>001.png</li>
                                            </ul>
                                        </li>
                                        <li>Chapter 3.cbz</li>
                                        <li>Chapter 4.pdf</li>
                                    </ul>
                                </li>
                                <li>
                                    Bleach\
                                    <ul>
                                        <li>
                                            Chapter 1\ <code>在这里使用“打开”</code>
                                            <ul>
                                                <li>001.png</li>
                                            </ul>
                                        </li>
                                        <li>Chapter 2.zip</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li>
                    支持拖放。
                    <ul>
                        <li>拖入文件夹会用该文件夹内容打开阅读器。</li>
                        <li>拖入受支持的图片文件会在阅读器中打开其父文件夹。</li>
                        <li>拖入压缩包或 EPUB 文件会直接在阅读器中打开。</li>
                    </ul>
                </li>
                <li id="settings-usage-searchShortcutKeys">
                    搜索栏快捷键：
                    <ul>
                        <li>
                            聚焦任意搜索栏后，使用{" "}
                            <code>{shortcuts.find((e) => e.command === "listDown")?.keys.join(", ")}</code> 或{" "}
                            <code>{shortcuts.find((e) => e.command === "listUp")?.keys.join(", ")}</code>{" "}
                            在结果中移动。
                        </li>
                        <li>
                            使用 <code>{shortcuts.find((e) => e.command === "listSelect")?.keys.join(", ")}</code>{" "}
                            打开已聚焦的项目。
                        </li>
                        <li>列表中只有一个项目且未聚焦项目时，也可用选择快捷键直接打开。</li>
                        <li>在空文件夹上使用选择快捷键，可以在阅读器中打开该文件夹。</li>
                        <li>
                            使用 <code>{shortcuts.find((e) => e.command === "dirUp")?.keys.join(", ")}</code>{" "}
                            返回上级目录。
                        </li>
                        <li>
                            使用{" "}
                            <code>{shortcuts.find((e) => e.command === "contextMenu")?.keys.join(", ")}</code>{" "}
                            打开已聚焦项目的右键菜单。
                        </li>
                        <li>
                            按类型搜索：输入 <code>manga|manhua|manhwa|webtoon|webcomic|comic</code>{" "}
                            搜索漫画类内容，输入 <code>epub</code> 搜索 EPUB。
                        </li>
                    </ul>
                </li>
                <li>
                    <b>主页位置标签：</b>
                    <ul>
                        <li>在“位置”标签中，单击项目查看内容；如果已在设置中启用，也可双击直接在阅读器中打开。</li>
                        <li>
                            <a
                                id="settings-usage-openDirectlyFromManga"
                                onClick={() => scrollIntoView("#settings-openDirectlyFromManga", "settings")}
                            >
                                当章节是“默认位置”下二级文件夹的子文件夹时，直接在阅读器中打开章节。
                            </a>
                            <br />
                            示例：默认位置为{" "}
                            {process.platform === "win32" ? <code>D:\manga</code> : <code>/home/manga</code>}，
                            其中有 <code>One Piece</code> 文件夹，则 <code>One Piece</code>{" "}
                            下的直属子文件夹会在主页位置列表中被直接打开为章节；如果没有找到图片，则正常作为文件夹进入。
                        </li>
                        <li>
                            <b>搜索：</b>
                            <ul>
                                <li>
                                    搜索时不必输入完整词。例如 <code>One Piece</code> 可以输入 <code>op</code>。
                                </li>
                                <li>
                                    精确搜索可在开头添加 <code>&quot;</code> 或 <code>`</code>，例如{" "}
                                    <code>`one</code>。
                                </li>
                                <li>粘贴路径可在“位置”标签中浏览；粘贴受支持文件路径可直接在阅读器中打开。</li>
                                <li>
                                    输入 <code>..{window.path.sep}</code> 返回上级目录。
                                </li>
                                {process.platform === "win32" ? (
                                    <li>
                                        输入 <code>D:\</code> 可跳转到 <code>D 盘</code>。
                                    </li>
                                ) : (
                                    ""
                                )}
                                <li>
                                    输入以 <code>{window.path.sep}</code> 结尾的名称可进入该文件夹。例如当前列表中有{" "}
                                    <code>One Piece</code>，输入 <code>One Piece{window.path.sep}</code> 可打开它。
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li>在主页中点击分隔条，可以折叠或展开书签、历史记录等标签页。</li>
                <li>
                    <b>阅读器：</b>
                    <ul>
                        <li>
                            使用“垂直滚动”模式时，可在第一页或最后一页点击屏幕两侧切换章节，也可使用上一页{" "}
                            <code>{shortcuts.find((e) => e.command === "prevPage")?.keys.join(", ")}</code> 或下一页{" "}
                            <code>{shortcuts.find((e) => e.command === "nextPage")?.keys.join(", ")}</code>{" "}
                            快捷键；屏幕中间 20% 区域不会响应。
                            <ul>
                                <li>左侧 = 上一章</li>
                                <li>右侧 = 下一章</li>
                                <li>如需使用“最大图片宽度”，请先关闭“尺寸：限制”。</li>
                            </ul>
                        </li>
                        <li>全页查看时若要用鼠标滚动，可使用从左到右/从右到左模式，并启用“垂直适配”或降低图片尺寸。</li>
                        <li>鼠标中键可自动滚动。</li>
                        <li>将鼠标移到屏幕左侧可打开侧边列表；侧边列表可以固定和调整宽度。</li>
                        <li>
                            <code>
                                {shortcuts.find((e) => e.command === "focusSideListSearch")?.keys.join(", ")}
                            </code>{" "}
                            聚焦侧边列表章节搜索。{" "}
                            <code>{shortcuts.find((e) => e.command === "randomChapter")?.keys.join(", ")}</code>{" "}
                            随机打开章节，并会尽量避开最近打开过的章节；也支持随机模式。
                        </li>
                        <li>
                            <b>随机模式</b>（侧边列表中的随机图标）：会将章节顺序随机一次，上一章/下一章会跟随随机顺序；该模式会禁用自动刷新，仅当前会话有效。
                        </li>
                        <li>
                            <b>侧边列表搜索：</b>筛选启用时，上一章/下一章和随机打开都会使用筛选后的列表。搜索框旁的固定图标可让筛选在列表刷新后保留。
                        </li>
                        <li>
                            Zen Mode（全屏模式）会隐藏 UI，只显示图片，以及已启用时的页码。可使用快捷键{" "}
                            <code>{shortcuts.find((e) => e.command === "toggleZenMode")?.keys.join(", ")}</code>{" "}
                            切换。
                        </li>
                        <li>
                            双击也可切换 Zen Mode。不同阅读模式下的有效区域：
                            <ul>
                                <li>垂直滚动：100%</li>
                                <li>垂直滚动（章节开始/结束）：中间 60%</li>
                                <li>LTR 和 RTL：中间 20%</li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li>
                    启用{" "}
                    <a onClick={() => scrollIntoView("#settings-fileExplorerOption", "settings")}>
                        文件资源管理器选项
                    </a>{" "}
                    后，可以从文件资源管理器直接打开章节。
                    <ul>
                        <li>
                            右键文件夹或 .cbz/.7z/.zip/.pdf/.epub &nbsp;&nbsp;&#8594;&nbsp;&nbsp; 显示更多选项（Win11）
                            &nbsp;&nbsp;&#8594;&nbsp;&nbsp; 用 Yomikiru 打开。
                        </li>
                        <li>注意：这只会打开包含图片的章节，不会打开漫画根文件夹。</li>
                    </ul>
                </li>
                <li>
                    <b>最小化到托盘：</b>在{" "}
                    <a onClick={() => scrollIntoView("#settings-otherSettings", "settings")}>其他设置</a>{" "}
                    中启用后，最小化会进入系统托盘而不是任务栏。单窗口时左键托盘图标可显示/隐藏窗口；多窗口时左键会恢复隐藏窗口或聚焦窗口。右键可查看窗口列表、“隐藏所有窗口”和退出。
                </li>
                <li>
                    <a id="settings-usage-copyTheme" onClick={() => scrollIntoView("#settings-copyTheme", "settings")}>
                        使用主题页中的“复制当前主题到剪贴板”复制主题
                    </a>
                    ，主题会以文本形式复制，可分享给他人。安装收到的主题时，复制完整文本并点击“从剪贴板保存主题”。
                </li>
                <li id="settings-usage-readerPresets">
                    <b>阅读器预设：</b>可在不同阅读布局间快速切换，例如双页 LTR 漫画和垂直滚动条漫。漫画阅读器和书籍（EPUB）阅读器拥有各自的预设列表。
                    <ul>
                        <li>默认预设：漫画包含“分页 LTR”“长条”“长条（带间距）”；书籍包含“默认”“连续”。首次运行会为每种类型创建一个“用户”预设。</li>
                        <li>“选择”会应用预设；删除图标会移除自定义预设；“用户”预设不可删除。</li>
                        <li>阅读器设置中的 + 可新增预设；“自动保存”开启时更改会自动写入当前预设，关闭时需要手动保存或使用 savePreset 快捷键。</li>
                        <li>
                            <code>{shortcuts.find((e) => e.command === "savePreset")?.keys.join(", ")}</code>{" "}
                            将当前设置保存到选中的预设，即使设置面板关闭也可使用。
                        </li>
                        <li>
                            <b>预设快捷键：</b>{" "}
                            <code>{shortcuts.find((e) => e.command === "cyclePresetNext")?.keys.join(", ")}</code>{" "}
                            /{" "}
                            <code>{shortcuts.find((e) => e.command === "cyclePresetPrev")?.keys.join(", ")}</code>{" "}
                            切换上一个/下一个预设。{" "}
                            {["selectPreset1", "selectPreset2", "selectPreset3", "selectPreset4", "selectPreset5"]
                                .map((c, idx) => {
                                    const keys = shortcuts.find((e) => e.command === c)?.keys.join(", ");
                                    return keys ? (
                                        <Fragment key={c}>
                                            <code>
                                                ({idx + 1}: {keys})
                                            </code>{" "}
                                            {idx < 4 ? ", " : ""}
                                        </Fragment>
                                    ) : null;
                                })
                                .filter(Boolean)}
                            可按显示顺序选择第 1-5 个预设；漫画阅读器选择漫画预设，EPUB 阅读器选择书籍预设。
                        </li>
                        <li>剪贴板、导出和导入功能可用于迁移预设；重置默认预设会恢复内置预设，但会保留自定义预设。</li>
                    </ul>
                </li>
                <li>
                    <a id="settings-usage-pdfScale" onClick={() => scrollIntoView("#settings-pdfScale", "settings")}>
                        <b>PDF 缩放：</b>
                    </a>{" "}
                    控制图片质量。数值越高质量越高，但初次处理时 CPU 和存储占用也越高。<br />
                    <b>页数较多的 PDF 不建议使用过高缩放。</b>
                </li>
                <li id="settings-usage-anilist">
                    <b>AniList 追踪：</b>
                    <ul>
                        <li>成功登录后，打开漫画并移到应用最左侧显示侧边列表，即可启用追踪。</li>
                        <li>追踪按漫画文件夹管理；如果漫画文件夹被移动、重命名或删除，本地追踪会移除，需要重新添加。</li>
                        <li>进度可自动更新，也可以在 AniList 面板中手动调整。</li>
                    </ul>
                </li>
                <li id="settings-usage-epubBackground">
                    <b>EPUB 阅读器背景：</b>阅读 EPUB 时打开阅读器设置。在<b>样式与其他</b>中，“页面背景色”是文字栏外的背景，“内容背景色”是文字栏自身。可展开<b>内容框架</b>调整水平间距和边框，也可展开<b>背景</b>设置壁纸。
                    <ul>
                        <li>启用背景图片后，选择图片并调整暗化强度、亮度和对比度。</li>
                        <li>可选启用图片图层叠加，并设置颜色和透明度。</li>
                        <li>
                            若要让文字栏透明以显示壁纸，可将内容背景色设置为透明，例如 <code>rgba(0,0,0,0)</code>。
                        </li>
                        <li>部分书籍自带较强的 CSS 颜色，可启用“覆盖 EPUB 内置颜色”，让你的非默认颜色优先生效。</li>
                    </ul>
                </li>
                <li id="settings-usage-customStylesheet">
                    如果你会写 <code>.css</code>，可以通过{" "}
                    <a onClick={() => scrollIntoView("#settings-customStylesheet", "settings")}>自定义样式表</a>{" "}
                    深度调整应用样式，不限于“主题制作”提供的主题颜色。可用开发者/检查工具查看元素和现有样式。
                    <br />
                    注意：不要把 <code>.css</code> 文件直接放在应用目录下。便携版更新时，除 <code>userdata</code>{" "}
                    文件夹外的内容可能被删除；建议放在 <code>userdata</code> 中。
                </li>
            </ul>
        </div>
    );
};

export default Usage;
