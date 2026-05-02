import { useAppContext } from "@app/context";
import ClassicView from "@features/home/ClassicView";
import EPubReader from "@features/reader/epub/EPubReader";
import Reader from "@features/reader/manga/Reader";
import Settings from "@features/settings/Settings";
import { useAppSelector } from "@store/hooks";
import InputColorReal from "@ui/InputColorReal";
import MenuList from "@ui/MenuList";
import type { ReactElement } from "react";
import { shallowEqual } from "react-redux";
import ContextMenu from "../components/ContextMenu";
import LoadingScreen from "../components/LoadingScreen";

const Main = (): ReactElement => {
    const appSettings = useAppSelector((store) => store.appSettings);
    const reader = useAppSelector(
        (store) => ({
            type: store.reader.type,
            link: store.reader.link,
        }),
        shallowEqual,
    );

    const { contextMenuData, optSelectData, colorSelectData } = useAppContext();

    return (
        <div id="app" className={appSettings.disableListNumbering ? "noListNumbering " : ""}>
            <ClassicView />
            <Settings />
            <LoadingScreen />
            {contextMenuData && <ContextMenu />}
            {optSelectData && <MenuList />}
            {colorSelectData && <InputColorReal />}
            {reader.link && (reader.type === "manga" ? <Reader /> : reader.type === "book" ? <EPubReader /> : "")}
        </div>
    );
};

export default Main;
