import { setAppSettings } from "@store/appSettings";
import { fetchAllBookmarks } from "@store/bookmarks";
import { fetchAllNotes } from "@store/bookNotes";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { fetchAllItemsWithProgress } from "@store/library";
import { getMainSettings } from "@store/mainSettings";
import { setTheme } from "@store/themes";
import { dialogUtils } from "@utils/dialog";
import { promptSelectDir } from "@utils/file";
import { useEffect, useState } from "react";

export const useAppBootstrap = () => {
    const dispatch = useAppDispatch();
    const appSettings = useAppSelector((state) => state.appSettings);
    const theme = useAppSelector((state) => state.theme.name);
    const [firstRendered, setFirstRendered] = useState(false);

    useEffect(() => {
        if (firstRendered) {
            if (appSettings.baseDir === "") {
                dialogUtils.customError({ message: "未找到设置，请选择漫画文件夹" });
                promptSelectDir((path) => dispatch(setAppSettings({ baseDir: path as string })));
            }
        } else {
            dispatch(setTheme(theme));
        }
    }, [appSettings.baseDir, dispatch, firstRendered, theme]);

    useEffect(() => {
        setFirstRendered(true);
        dispatch(fetchAllItemsWithProgress());
        dispatch(fetchAllBookmarks());
        dispatch(fetchAllNotes());
        dispatch(getMainSettings());
    }, [dispatch]);
};
