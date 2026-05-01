import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { removeShortcuts, setShortcuts } from "@store/shortcuts";
import { dialogUtils } from "@utils/dialog";
import { keyFormatter, mouseEventFormatter, SHORTCUT_COMMAND_MAP } from "@utils/keybindings";
import { createRendererLogger } from "@utils/logger";
import type { ReactElement } from "react";
import { reservedKeys, SHORTCUT_LIMIT } from "../utils/constants";

const log = createRendererLogger("settings/Shortcuts");

const ShortcutInput = ({ command }: { command: ShortcutCommands }) => {
    const shortcuts = useAppSelector((store) => store.shortcuts);
    const dispatch = useAppDispatch();
    const shortcut = shortcuts.find((e) => e.command === command);
    if (!shortcut) return <p>未找到命令 &quot;{command}&quot;。</p>;

    const tryAddShortcut = (newKey: string, inputRef?: HTMLInputElement) => {
        const dupIndex = shortcuts.findIndex((s) => s.keys.includes(newKey));
        if (dupIndex >= 0) {
            const name =
                SHORTCUT_COMMAND_MAP.find((s) => s.command === shortcuts[dupIndex].command)?.name || command;
            log.warn(`"${newKey}" already bound to "${shortcuts[dupIndex].command}"`);
            dialogUtils.warn({ message: `"${newKey}" 已绑定到 "${name}"。` });
            return;
        }
        if (reservedKeys.includes(newKey)) {
            dialogUtils.warn({ message: "不能使用保留的快捷键组合。" });
            log.warn(`"${newKey}" is reserved key combination.`);
            inputRef?.focus();
            return;
        }
        dispatch(setShortcuts({ command, key: newKey }));
    };

    return (
        <>
            {shortcut.keys.map((key, i) => (
                <div className="keyDisplay" key={i} title={key}>
                    <input
                        type="text"
                        value={key}
                        readOnly
                        spellCheck={false}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                                e.preventDefault();
                                e.stopPropagation();
                                dispatch(removeShortcuts({ command, key }));
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            dispatch(removeShortcuts({ command, key }));
                        }}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </div>
            ))}
            {shortcut.keys.length < SHORTCUT_LIMIT && (
                <input
                    className="addNewKey"
                    type="text"
                    value={""}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (!["Tab", "Escape"].includes(e.key)) e.preventDefault();
                    }}
                    onKeyUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newKey = keyFormatter(e.nativeEvent);
                        if (newKey === "") return;
                        tryAddShortcut(newKey, e.currentTarget);
                    }}
                    onMouseDown={(e) => {
                        const newKey = mouseEventFormatter(e.nativeEvent);
                        if (newKey === "") return;
                        e.preventDefault();
                        e.stopPropagation();
                        tryAddShortcut(newKey);
                    }}
                    placeholder="新增"
                    readOnly
                    spellCheck={false}
                />
            )}
        </>
    );
};

const Shortcuts = (): ReactElement => {
    return (
        <div className="shortcutKey">
            <ul>
                <li>部分更改可能需要重启应用。</li>
                <li>可以使用鼠标中键或拖拽来滚动阅读器。</li>
                <li>
                    鼠标按键 4 或 5（后退/前进）：先将鼠标悬停在“新增”输入框上，然后点击绑定。
                </li>
                <li>
                    使用 <code>Backspace</code> 清除快捷键绑定。
                </li>
                <li>
                    保留快捷键：{" "}
                    {reservedKeys.map((e) => (
                        <span key={e}>
                            <code>{e}</code>{" "}
                        </span>
                    ))}
                    .
                </li>
            </ul>
            <table>
                <tbody>
                    <tr>
                        <th>功能</th>
                        <th>快捷键</th>
                    </tr>
                    {SHORTCUT_COMMAND_MAP.map((e) => (
                        <tr key={e.command}>
                            <td>
                                {e.name}
                            </td>
                            <td>
                                <ShortcutInput command={e.command} />
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td>新窗口</td>
                        <td>
                            <code>ctrl+n</code>
                        </td>
                    </tr>
                    <tr>
                        <td>关闭窗口</td>
                        <td>
                            <code>ctrl+w</code>
                        </td>
                    </tr>
                    <tr>
                        <td>阅读器宽度</td>
                        <td>
                            <code>ctrl+scroll</code>
                        </td>
                    </tr>
                    <tr>
                        <td>重载 UI</td>
                        <td>
                            <code>ctrl+r</code>
                        </td>
                    </tr>
                    <tr>
                        <td>重载 UI 并尝试清除缓存</td>
                        <td>
                            <code>ctrl+shift+r</code>
                        </td>
                    </tr>
                    <tr>
                        <td>开发者工具</td>
                        <td>
                            <code>ctrl+shift+i</code>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Shortcuts;
