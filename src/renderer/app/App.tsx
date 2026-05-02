import { useDirectoryValidator } from "@features/reader/hooks/useDirectoryValidator";
import { useAppSelector } from "@store/hooks";
import { createRef, type ReactElement, useState } from "react";
import TopBar from "../TopBar";
import { AppContext } from "./context";
import { useAppBootstrap } from "./hooks/useAppBootstrap";
import { useAppIpcListeners } from "./hooks/useAppIpcListeners";
import { useContextMenuTemplate } from "./hooks/useContextMenuTemplate";
import { useFileDropOpen } from "./hooks/useFileDropOpen";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { useReaderLifecycle } from "./hooks/useReaderLifecycle";
import Main from "./Main";

const App = (): ReactElement => {
    const isReaderOpen = useAppSelector((state) => state.reader.active);
    const linkInReader = useAppSelector((state) => state.reader.link);

    const pageNumberInputRef: React.RefObject<HTMLInputElement> = createRef();
    const bookProgressRef: React.RefObject<HTMLInputElement> = createRef();
    const [contextMenuData, setContextMenuData] = useState<Menu.ContextMenuData | null>(null);
    const [optSelectData, setOptSelectData] = useState<Menu.OptSelectData | null>(null);
    const [colorSelectData, setColorSelectData] = useState<Menu.ColorSelectData | null>(null);

    const { openInReaderIfValid, validateDirectory } = useDirectoryValidator();
    const { closeReader, openInNewWindow } = useReaderLifecycle();

    useAppBootstrap();
    useAppIpcListeners({ closeReader, isReaderOpen, openInReaderIfValid });
    useContextMenuTemplate({ openInNewWindow, openInReaderIfValid });
    useGlobalShortcuts({ closeReader, isReaderOpen });
    useFileDropOpen({ closeReader, linkInReader, openInReaderIfValid });

    return (
        <AppContext.Provider
            value={{
                pageNumberInputRef,
                bookProgressRef,
                openInReader: openInReaderIfValid,
                closeReader,
                openInNewWindow,
                validateDirectory,
                contextMenuData,
                setContextMenuData,
                optSelectData,
                setOptSelectData,
                colorSelectData,
                setColorSelectData,
            }}
        >
            <TopBar />
            <Main />
        </AppContext.Provider>
    );
};

export default App;
