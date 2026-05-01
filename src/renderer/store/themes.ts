import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { colorUtils } from "@utils/color";
import { initThemeData } from "../utils/theme";

const THEME_STORAGE_KEY = "theme";

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
    const themeData = allData.find((e) => e.name === name)?.main ?? initThemeData.allData[0].main;
    let themeStr = "";
    for (const key in themeData) {
        themeStr += `${key}:${themeData[key as ThemeDataMain]};`;
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
};

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const initialState: Themes = {
    name: initThemeData.allData.some((theme) => theme.name === savedTheme) ? savedTheme || initThemeData.name : initThemeData.name,
    allData: initThemeData.allData,
};

const themes = createSlice({
    name: "allThemes",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<string>) => {
            const name = state.allData.some((theme) => theme.name === action.payload)
                ? action.payload
                : initThemeData.name;
            state.name = name;
            localStorage.setItem(THEME_STORAGE_KEY, name);
            setBodyTheme({ name, allData: state.allData });
        },
        resetAllTheme: () => {
            localStorage.setItem(THEME_STORAGE_KEY, initThemeData.name);
            setBodyTheme(initThemeData);
            return initThemeData;
        },
    },
});

export const { setTheme, resetAllTheme } = themes.actions;

export default themes.reducer;
