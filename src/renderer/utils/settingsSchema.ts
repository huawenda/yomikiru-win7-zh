import { z } from "zod";
import { dialogUtils } from "./dialog";
import { saveJSONfile, settingsPath } from "./file";
import { createRendererLogger } from "./logger";
import { getValueFromDeepObject } from "./objectPath";
import { USER_PRESET_BOOK_ID, USER_PRESET_MANGA_ID } from "./readerPresets";
import {
    bookReaderSettingsSchema,
    defaultBookReaderSettings,
    defaultMangaReaderSettings,
    mangaReaderSettingsSchema,
} from "./readerSettingsSchema";
import { readJsonFileWithRetrySync } from "./readJsonFileWithRetry";
import { repairZodInputWithDefaults } from "./zodRepair";

const log = createRendererLogger("settingsSchema");

const sortTypeEnum = z.union([z.literal("normal"), z.literal("inverse")]);
const sortByEnum = z.union([z.literal("name"), z.literal("date")]);

const settingSchema = z
    .object({
        baseDir: z.string(),
        locationListSortType: sortTypeEnum,
        locationListSortBy: sortByEnum,
        bookListSortType: sortTypeEnum,
        bookListSortBy: sortByEnum,
        historyListSortType: sortTypeEnum,
        historyListSortBy: sortByEnum,
        /**
         * Open chapter in reader directly, one folder inside of base manga dir.
         */
        openDirectlyFromManga: z.boolean(),
        showTabs: z.object({
            bookmark: z.boolean(),
            history: z.boolean(),
        }),
        useCanvasBasedReader: z.boolean(),
        openOnDblClick: z.boolean(),
        disableListNumbering: z.boolean(),
        /**
         * show search input for history and bookmark
         */
        showSearch: z.boolean(),

        openInZenMode: z.boolean(),
        hideCursorInZenMode: z.boolean(),
        /**
         * Show more data in title attr in bookmark/history tab items
         */
        showMoreDataOnItemHover: z.boolean(),
        keepExtractedFiles: z.boolean(),
        checkboxReaderSetting: z.boolean(),
        /**
         * Confirm before deleting item from history/bookmark/note
         * only in side list
         * always true on home page
         */
        confirmDeleteItem: z.boolean(),

        //styles

        showPageCountInSideList: z.boolean(),
        showTextFileBadge: z.boolean(),

        //styles end

        readerSettings: mangaReaderSettingsSchema,
        epubReaderSettings: bookReaderSettingsSchema,
        mangaReaderPresetId: z.string(),
        bookReaderPresetId: z.string(),
    })
    .strip()
    // it is separate do i dont leave default-less value
    .default({
        baseDir: window.electron.app.getPath("home"),
        locationListSortType: "normal",
        locationListSortBy: "name",
        bookListSortType: "normal",
        bookListSortBy: "date",
        historyListSortType: "normal",
        historyListSortBy: "date",
        openDirectlyFromManga: false,
        showTabs: {
            bookmark: true,
            history: true,
        },
        useCanvasBasedReader: false,
        openOnDblClick: true,
        disableListNumbering: true,
        showSearch: true,
        openInZenMode: false,
        hideCursorInZenMode: false,
        showMoreDataOnItemHover: true,
        keepExtractedFiles: true,
        checkboxReaderSetting: false,
        confirmDeleteItem: true,
        showPageCountInSideList: true,
        showTextFileBadge: true,
        readerSettings: defaultMangaReaderSettings,
        epubReaderSettings: defaultBookReaderSettings,
        mangaReaderPresetId: USER_PRESET_MANGA_ID,
        bookReaderPresetId: USER_PRESET_BOOK_ID,
    });

export const defaultSettings = settingSchema.parse(undefined);

const makeSettingsJson = () => {
    saveJSONfile(settingsPath, defaultSettings);
};
let settingNotFound = false;
if (!window.fs.existsSync(settingsPath)) {
    // dialogUtils.warn({ message: "No settings found, Select manga folder to make default in settings" });
    settingNotFound = true;
    makeSettingsJson();
}

const parseAppSettings = (): z.infer<typeof settingSchema> => {
    if (settingNotFound) {
        settingNotFound = false;
        return defaultSettings;
    }

    try {
        const parsedJSON = readJsonFileWithRetrySync(settingsPath, {
            maxAttempts: 10,
            onRetry: (attempt, error) => {
                log.log(`settings.json read retry ${attempt}/10`, error);
            },
        });
        const first = settingSchema.safeParse(parsedJSON);
        if (first.success) return first.data;

        log.log(
            "settings.json failed validation; paths with issues:",
            first.error.issues.map((e) => e.path.join(".")),
        );

        const repaired = repairZodInputWithDefaults(settingSchema, parsedJSON, (path) =>
            getValueFromDeepObject(defaultSettings, path),
        );
        if (!repaired.success) {
            log.error("settings.json could not be repaired with defaults; remaking file");
            dialogUtils.customError({ message: "无法解析 settings.json，正在重新生成。" });
            makeSettingsJson();
            return defaultSettings;
        }
        dialogUtils.warn({
            message: "部分设置无效，或新增了设置项。正在重新写入设置。",
        });
        saveJSONfile(settingsPath, repaired.data);
        return repaired.data;
    } catch (err) {
        log.error("settings.json read or parse threw; remaking file", err);
        dialogUtils.customError({ message: "无法解析 settings.json，正在重新生成。" });
        makeSettingsJson();
        return defaultSettings;
    }
};

export { settingSchema, parseAppSettings, makeSettingsJson };
