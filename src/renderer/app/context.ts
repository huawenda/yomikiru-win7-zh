import type { useDirectoryValidator } from "@features/reader/hooks/useDirectoryValidator";
import { createContext, type RefObject, useContext } from "react";

export interface AppContext {
    pageNumberInputRef: RefObject<HTMLInputElement>;
    bookProgressRef: RefObject<HTMLInputElement>;
    /**
     * Check if folder have images then open those images in reader, or open in epub-reader if `.epub`
     * @param link link of folder containing images or epub file.
     */
    openInReader: ReturnType<typeof useDirectoryValidator>["openInReaderIfValid"];
    closeReader: () => Promise<void>;
    openInNewWindow: (link: string) => void;
    contextMenuData: Menu.ContextMenuData | null;
    setContextMenuData: React.Dispatch<React.SetStateAction<Menu.ContextMenuData | null>>;
    optSelectData: Menu.OptSelectData | null;
    setOptSelectData: React.Dispatch<React.SetStateAction<Menu.OptSelectData | null>>;
    colorSelectData: Menu.ColorSelectData | null;
    setColorSelectData: React.Dispatch<React.SetStateAction<Menu.ColorSelectData | null>>;
    validateDirectory: ReturnType<typeof useDirectoryValidator>["validateDirectory"];
}

export const AppContext = createContext<AppContext | null>(null);

export const useAppContext = (): AppContext => {
    const context = useContext(AppContext);
    if (!context) throw new Error("AppContext not found");
    return context;
};
