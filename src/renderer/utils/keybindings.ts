export const SHORTCUT_COMMAND_MAP = [
    {
        command: "navToPage" as const,
        name: "搜索页码",
        defaultKeys: ["f"],
    },
    {
        command: "toggleZenMode" as const,
        name: "切换 Zen Mode / 全屏",
        defaultKeys: ["backquote"],
    },
    {
        command: "largeScroll" as const,
        name: "向下滚动（滚动 B）",
        defaultKeys: ["space"],
    },
    {
        command: "largeScrollReverse" as const,
        name: "向上滚动（滚动 B）",
        defaultKeys: ["shift+space"],
    },
    {
        command: "scrollDown" as const,
        name: "向下滚动（滚动 A）",
        defaultKeys: ["s", "down"],
    },
    {
        command: "scrollUp" as const,
        name: "向上滚动（滚动 A）",
        defaultKeys: ["w", "up"],
    },
    {
        command: "prevPage" as const,
        name: "上一页",
        defaultKeys: ["a", "left", "mouse4"],
    },
    {
        command: "nextPage" as const,
        name: "下一页",
        defaultKeys: ["d", "right", "mouse5"],
    },
    {
        command: "nextChapter" as const,
        name: "下一章",
        defaultKeys: ["bracketright"],
    },
    {
        command: "prevChapter" as const,
        name: "上一章",
        defaultKeys: ["bracketleft"],
    },
    {
        command: "focusSideListSearch" as const,
        name: "聚焦侧边列表搜索（漫画阅读器）",
        defaultKeys: ["ctrl+shift+f"],
    },
    {
        command: "randomChapter" as const,
        name: "随机打开章节（漫画阅读器）",
        defaultKeys: ["r"],
    },
    {
        command: "bookmark" as const,
        name: "书签",
        defaultKeys: ["b"],
    },
    {
        command: "sizePlus" as const,
        name: "增大阅读器尺寸",
        defaultKeys: ["equal", "numpad_plus"],
    },
    {
        command: "sizeMinus" as const,
        name: "减小阅读器尺寸",
        defaultKeys: ["minus", "numpad_minus"],
    },
    {
        command: "readerSettings" as const,
        name: "打开/关闭阅读器设置",
        defaultKeys: ["q"],
    },
    {
        command: "savePreset" as const,
        name: "将当前设置保存到选中预设",
        defaultKeys: ["ctrl+s"],
    },
    {
        command: "cyclePresetNext" as const,
        name: "下一个预设",
        defaultKeys: ["alt+period"],
    },
    {
        command: "cyclePresetPrev" as const,
        name: "上一个预设",
        defaultKeys: ["alt+comma"],
    },
    {
        command: "selectPreset1" as const,
        name: "选择预设 1",
        defaultKeys: ["alt+1"],
    },
    {
        command: "selectPreset2" as const,
        name: "选择预设 2",
        defaultKeys: ["alt+2"],
    },
    {
        command: "selectPreset3" as const,
        name: "选择预设 3",
        defaultKeys: ["alt+3"],
    },
    {
        command: "selectPreset4" as const,
        name: "选择预设 4",
        defaultKeys: ["alt+4"],
    },
    {
        command: "selectPreset5" as const,
        name: "选择预设 5",
        defaultKeys: ["alt+5"],
    },
    {
        command: "showHidePageNumberInZen" as const,
        name: "显示/隐藏 Zen Mode 页码",
        defaultKeys: ["p"],
    },
    {
        command: "cycleFitOptions" as const,
        name: "循环切换适配选项",
        defaultKeys: ["v"],
    },
    {
        command: "selectReaderMode0" as const,
        name: "阅读模式 - 纵向滚动",
        defaultKeys: ["9"],
    },
    {
        command: "selectReaderMode1" as const,
        name: "阅读模式 - LTR",
        defaultKeys: ["0"],
    },
    {
        command: "selectReaderMode2" as const,
        name: "阅读模式 - RTL",
        defaultKeys: [],
    },
    {
        command: "selectPagePerRow1" as const,
        name: "选择每行页数 - 1",
        defaultKeys: ["1"],
    },
    {
        command: "selectPagePerRow2" as const,
        name: "选择每行页数 - 2",
        defaultKeys: ["2"],
    },
    {
        command: "selectPagePerRow2odd" as const,
        name: "选择每行页数 - 2odd",
        defaultKeys: ["3"],
    },
    {
        command: "fontSizePlus" as const,
        name: "增大字体大小（EPUB）",
        defaultKeys: ["shift+equal"],
    },
    {
        command: "fontSizeMinus" as const,
        name: "减小字体大小（EPUB）",
        defaultKeys: ["shift+minus"],
    },
    {
        command: "navToHome" as const,
        name: "主页",
        defaultKeys: ["h"],
    },
    {
        command: "dirUp" as const,
        name: "上一级目录",
        defaultKeys: ["alt+up"],
    },
    {
        command: "contextMenu" as const,
        name: "右键菜单",
        defaultKeys: ["ctrl+slash", "shift+f10", "menu"],
    },
    {
        command: "readerSize_50" as const,
        name: "阅读器尺寸：50%",
        defaultKeys: ["ctrl+1"],
    },
    {
        command: "readerSize_100" as const,
        name: "阅读器尺寸：100%",
        defaultKeys: ["ctrl+2"],
    },
    {
        command: "readerSize_150" as const,
        name: "阅读器尺寸：150%",
        defaultKeys: ["ctrl+3"],
    },
    {
        command: "readerSize_200" as const,
        name: "阅读器尺寸：200%",
        defaultKeys: ["ctrl+4"],
    },
    {
        command: "readerSize_250" as const,
        name: "阅读器尺寸：250%",
        defaultKeys: ["ctrl+5"],
    },
    {
        command: "openSettings" as const,
        name: "设置",
        defaultKeys: ["ctrl+i"],
    },
    {
        command: "uiSizeReset" as const,
        name: "重置 UI 尺寸",
        defaultKeys: ["ctrl+0"],
    },
    {
        command: "uiSizeDown" as const,
        name: "减小 UI 尺寸",
        defaultKeys: ["ctrl+minus"],
    },
    {
        command: "uiSizeUp" as const,
        name: "增大 UI 尺寸",
        defaultKeys: ["ctrl+equal"],
    },
    {
        command: "listDown" as const,
        name: "列表向下",
        defaultKeys: ["down", "ctrl+j"],
    },
    {
        command: "listUp" as const,
        name: "列表向上",
        defaultKeys: ["up", "ctrl+k"],
    },
    {
        command: "listSelect" as const,
        name: "选择列表项",
        defaultKeys: ["enter"],
    },
];
Object.freeze(SHORTCUT_COMMAND_MAP);

/**
 * Format key event to string (e.g. "ctrl+shift+a", "ctrl+shift+numpad_plus")
 * @param e key event
 * @param limited Do not include some keys (e.g. "Control", "Shift", "Alt", "Tab", "Escape")
 * @returns formatted key string
 */
export const keyFormatter = (e: KeyboardEvent | React.KeyboardEvent, limited = true): string => {
    if (limited && ["Control", "Shift", "Alt", "Tab", "Escape"].includes(e.key)) return "";

    // using lowercase because more readable
    let keyStr = "";
    if (e.ctrlKey) keyStr += "ctrl+";
    if (e.shiftKey) keyStr += "shift+";
    if (e.altKey) keyStr += "alt+";

    switch (true) {
        case /^Key[A-Z]$/.test(e.code):
            keyStr += e.code.slice(3).toLowerCase();
            break;
        case /^Digit[0-9]$/.test(e.code):
            keyStr += e.code.slice(5);
            break;
        case /^Numpad[0-9]$/.test(e.code):
            keyStr += `numpad_${e.code.slice(6)}`;
            break;
        case e.code === "NumpadAdd":
            keyStr += "numpad_plus";
            break;
        case e.code === "NumpadSubtract":
            keyStr += "numpad_minus";
            break;
        case e.code === "NumpadMultiply":
            keyStr += "numpad_multiply";
            break;
        case e.code === "NumpadDivide":
            keyStr += "numpad_divide";
            break;
        case e.code === "NumpadDecimal":
            keyStr += "numpad_period";
            break;
        case e.code.startsWith("Arrow"):
            keyStr += e.code.slice(5).toLowerCase();
            break;
        case e.code === "PageDown":
            keyStr += "pagedown";
            break;
        case e.code === "PageUp":
            keyStr += "pageup";
            break;
        case e.code === "ContextMenu":
            keyStr += "menu";
            break;
        default:
            keyStr += e.code.toLowerCase();
            break;
    }
    return keyStr;
};

/** MouseEvent.button: 3=back, 4=forward. Only these are supported to avoid breaking left/middle/right click. */
const MOUSE_BUTTON_TO_KEY: Record<number, string> = {
    3: "mouse4",
    4: "mouse5",
};

/**
 * Format mouse event to shortcut key string for buttons 4 and 5 (back/forward).
 * @param e mouse event
 * @param checkFocus When true (default), returns "" unless document has focus and event target is within focused element
 * @returns "mouse4" | "mouse5" | ""
 */
export const mouseEventFormatter = (e: MouseEvent, checkFocus = true): string => {
    if (checkFocus) {
        if (!document.hasFocus()) return "";
        const active = document.activeElement;
        if (!active || !active.contains(e.target as Node)) return "";
    }
    return MOUSE_BUTTON_TO_KEY[e.button] ?? "";
};
