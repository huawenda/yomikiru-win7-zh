import { createSlice, current, type PayloadAction } from "@reduxjs/toolkit";
import { colorUtils } from "@utils/color";
import { dialogUtils } from "@utils/dialog";
import { saveJSONfile, themesPath } from "../utils/file";
import { createRendererLogger } from "../utils/logger";
import { readJsonFileWithRetrySync } from "../utils/readJsonFileWithRetry";
import { initThemeData, themeProps } from "../utils/theme";

const log = createRendererLogger("store/themes");

export const setSysBtnColor = (blurred = false) => {
    const topbarElem = document.querySelector<HTMLDivElement>("body #topBar");
    if (topbarElem) {
        let color = colorUtils.new(
            window.getComputedStyle(document.body).getPropertyValue("--icon-color") || "#ffffff",
        );
        if (blurred) {
            color = color.alpha(0.3);
        }
        topbarElem.style.color = color.hexa();
        process.platform === "win32" &&
            window.electron.currentWindow.setTitleBarOverlay()({
                color: window.getComputedStyle(topbarElem).backgroundColor,
                symbolColor: color.hexa(),
                height: Math.floor(window.app.titleBarHeight * window.electron.webFrame.getZoomFactor()),
            });
    }
};

const setBodyTheme = ({ allData, name }: Themes) => {
    if (allData.map((e) => e.name).includes(name)) {
        let themeStr = "";
        if (allData.find((e) => e.name)) {
            const themeData: { [key: string]: string } = allData.find((e) => e.name === name)!.main;
            for (const key in themeData) {
                themeStr += `${key}:${themeData[key]};`;
            }
            document.body.style.cssText = themeStr || "";
            document.body.setAttribute("data-theme", name);
            if (process.platform === "win32") {
                setTimeout(() => {
                    setSysBtnColor(!window.electron.currentWindow.isFocused());
                    const elem = document.querySelector(".windowBtnCont") as HTMLDivElement;
                    if (elem) elem.style.right = `${140 * (1 / window.electron.webFrame.getZoomFactor())}px`;
                }, 1000);
            }
        } else {
            dialogUtils.customError({
                title: "错误",
                message: `主题“${name}”不存在或已损坏。\n正在重写主题`,
            });
            window.fs.rm(window.path.join(window.electron.app.getPath("userData"), "themes.json"));
            window.location.reload();
        }
    } else {
        dialogUtils.customError({
            title: "错误",
            message: `主题“${name}”不存在。请尝试修复或删除 userdata 文件夹中的 theme.json 和 settings.json（位于 "%appdata%/Yomikiru/"，便携版则在主文件夹中）。`,
        });
    }
};

const initialState: Themes = {
    name: "theme2",
    allData: [],
};

if (window.fs.existsSync(themesPath)) {
    try {
        const data = readJsonFileWithRetrySync<Themes>(themesPath, {
            maxAttempts: 10,
            onRetry: (attempt, error) => {
                log.log(`themes.json read retry ${attempt}/10`, error);
            },
        });
        let changed = false;

        // validate theme data
        if (typeof data.allData[0].main === "string" || !Array.isArray(data.allData))
            throw { message: "theme.main 中不存在主题变量" };
        const addedProp = new Set<string>();
        for (const prop in themeProps) {
            let rewriteNeeded = false;
            (data as Themes).allData.forEach((e) => {
                if (!e.main[prop as ThemeDataMain]) {
                    if (initThemeData.allData.map((t) => t.name).includes(e.name)) {
                        log.log(`Theme "${e.name}": missing CSS var "${prop}"; replaced block from default theme`);
                        e.main = initThemeData.allData.find((t) => t.name === e.name)!.main;
                        rewriteNeeded = true;
                    } else {
                        log.log(`Theme "${e.name}": missing "${prop}"; filled with placeholder #ff0000`);
                        addedProp.add(`\t"${themeProps[prop as ThemeDataMain]}"`);
                        rewriteNeeded = true;
                        changed = true;
                        e.main[prop as ThemeDataMain] = "#ff0000";
                    }
                }
                /**check and fix change in theme value */
                initThemeData.allData.forEach((e) => {
                    const dataTheme = (data as Themes).allData.find((a) => a.name === e.name);
                    if (dataTheme)
                        Object.entries(e.main).forEach(([key, value]) => {
                            dataTheme.main[key as keyof ThemeData["main"]] = value;
                        });
                });
            });
            if (rewriteNeeded) saveJSONfile(themesPath, data);
        }
        // check if default theme exist
        if (changed) {
            dialogUtils.warn({
                message:
                    'Some properties were missing in themes. Added new as "Red" color, change accordingly or re-edit default themes.' +
                    "\nNew Properties:\n" +
                    [...addedProp.values()].join("\n"),
            });
        }
        initialState.name = data.name;
        initialState.allData = data.allData;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message === "newTheme")
            dialogUtils.customError({
                message: "主题系统已变更，旧主题将被删除。给你带来不便很抱歉。",
            });
        else
            dialogUtils.customError({
                message: `Unable to parse ${themesPath}\nMaking new themes.json...\n${err}`,
            });
        log.error("themes.json invalid; restoring bundled defaults", err);
        initialState.name = initThemeData.name;
        initialState.allData = initThemeData.allData;
        saveJSONfile(themesPath, initThemeData);
    }
} else {
    initialState.name = initThemeData.name;
    initialState.allData = initThemeData.allData;
    saveJSONfile(themesPath, initThemeData);
}

if (!initialState.allData.map((e) => e.name).includes(initialState.name)) {
    dialogUtils.customError({
        title: "错误",
        message: `主题“${initialState.name}”不存在。正在切换到默认主题。`,
    });
    initialState.name = "theme2";
    saveJSONfile(themesPath, initialState);
    window.location.reload();
}

const saveJSONandApply = (state: Themes) => {
    setBodyTheme(state);
    saveJSONfile(themesPath, state);
};

const themes = createSlice({
    name: "allThemes",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<string>) => {
            const newStore: Themes = { ...state, name: action.payload };
            saveJSONandApply({ name: newStore.name, allData: current(newStore.allData) });
            return newStore;
        },
        newTheme: (state, action: PayloadAction<ThemeData>) => {
            if (state.allData.map((e) => e.name).includes(action.payload.name)) {
                log.error(`add newTheme: name already exists (${action.payload.name})`);
            } else state.allData.push(action.payload);
        },
        refreshThemes: () => {
            try {
                return readJsonFileWithRetrySync<Themes>(themesPath, {
                    maxAttempts: 8,
                    onRetry: (attempt, error) => {
                        log.log(`themes.json refresh retry ${attempt}/8`, error);
                    },
                });
            } catch {
                dialogUtils.customError({
                    title: "错误",
                    message: `无法解析 ${themesPath}\n正在创建新的 themes.json...`,
                });
            }
        },
        addThemes: (state, action: PayloadAction<ThemeData[]>) => {
            if (Array.isArray(action.payload)) {
                action.payload.forEach((theme) => {
                    if ("name" in theme) {
                        if (state.allData.map((e) => e.name).includes(theme.name)) {
                            log.error(`addThemes: duplicate name skipped (${theme.name})`);
                        } else state.allData.push(theme);
                    }
                });
            }
        },
        updateTheme: (state, action: PayloadAction<{ themeName: string; newThemeData: typeof themeProps }>) => {
            state.allData[state.allData.findIndex((e) => e.name === action.payload.themeName)].main =
                action.payload.newThemeData;
            saveJSONandApply(current(state));
        },
        deleteTheme: (state, action: PayloadAction<number | string>) => {
            let index = -1;

            if (typeof action.payload === "number") index = action.payload;
            if (typeof action.payload === "string")
                index = state.allData.findIndex((e) => e.name === action.payload);
            state.allData.splice(index, 1);

            saveJSONfile(themesPath, current(state));
        },
        resetAllTheme: () => {
            saveJSONandApply(initThemeData);
            return initThemeData;
        },
    },
});

export const { newTheme, updateTheme, deleteTheme, setTheme, resetAllTheme, addThemes, refreshThemes } =
    themes.actions;

export default themes.reducer;
