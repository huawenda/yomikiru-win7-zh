/**
 * [index, name]
 */
const TAB_INFO = {
    settings: [0, "设置"],
    shortcutKeys: [1, "快捷键"],
    makeTheme: [2, "主题制作"],
    extras: [3, "附加说明"],
} as const;

Object.freeze(TAB_INFO);

const reservedKeys = ["ctrl+shift+i", "escape", "tab", "ctrl+n", "ctrl+w", "ctrl+r", "ctrl+shift+r"];
const SHORTCUT_LIMIT = 4 as const;

Object.freeze(SHORTCUT_LIMIT);

export { reservedKeys, SHORTCUT_LIMIT, TAB_INFO };
