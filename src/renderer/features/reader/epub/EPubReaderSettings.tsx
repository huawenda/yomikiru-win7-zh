import ReaderPresetSection from "@features/reader/components/ReaderPresetSection";
import { faBars, faMinus, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setEpubReaderSettings } from "@store/appSettings";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { updateBookPreset } from "@store/readerPresets";
import { getShortcutsMapped } from "@store/shortcuts";
import InputCheckbox from "@ui/InputCheckbox";
import InputCheckboxColor from "@ui/InputCheckboxColor";
import InputCheckboxNumber from "@ui/InputCheckboxNumber";
import InputNumber from "@ui/InputNumber";
import InputRange from "@ui/InputRange";
import InputSelect from "@ui/InputSelect";
import { colorUtils } from "@utils/color";
import { keyFormatter } from "@utils/keybindings";
import { createRendererLogger } from "@utils/logger";
import { memo, useEffect, useLayoutEffect, useState } from "react";

const log = createRendererLogger("epub/EPubReaderSettings");

import BackgroundSettings from "./components/BackgroundSettings";
import ContentFrameSettings from "./components/ContentFrameSettings";

const EPUBReaderSettings = memo(
    ({
        makeScrollPos,
        readerRef,
        readerSettingExtender,
        setShortcutText,
        sizePlusRef,
        sizeMinusRef,
        fontSizePlusRef,
        fontSizeMinusRef,
    }: {
        makeScrollPos: () => void;
        readerRef: React.RefObject<HTMLDivElement>;
        readerSettingExtender: React.RefObject<HTMLButtonElement>;
        setShortcutText: React.Dispatch<React.SetStateAction<string>>;
        sizePlusRef: React.RefObject<HTMLButtonElement>;
        sizeMinusRef: React.RefObject<HTMLButtonElement>;
        fontSizePlusRef: React.RefObject<HTMLButtonElement>;
        fontSizeMinusRef: React.RefObject<HTMLButtonElement>;
    }) => {
        const appSettings = useAppSelector((store) => store.appSettings);
        const shortcutsMapped = useAppSelector(getShortcutsMapped);
        const currentPresetName = useAppSelector((s) => {
            const id = s.appSettings.bookReaderPresetId;
            return id ? s.readerPresets.presets.find((p) => p.id === id)?.name : null;
        });
        const dispatch = useAppDispatch();

        const [isReaderSettingsOpen, setReaderSettingOpen] = useState(false);
        const [fontList, setFontList] = useState<string[]>([]);

        useLayoutEffect(() => {
            window
                .getFonts()
                .then((e) => {
                    setFontList(e);
                })
                .catch((e) => {
                    log.error("getFonts() failed (system font list unavailable)", e);
                });
        }, []);

        const maxWidth = 100;
        useEffect(() => {
            const f = (e: KeyboardEvent) => {
                if (isReaderSettingsOpen && e.key === "Escape") {
                    setReaderSettingOpen(false);
                    if (readerRef.current) readerRef.current.focus();
                    return;
                }
                const keyStr = keyFormatter(e);
                if (keyStr && shortcutsMapped.savePreset?.includes(keyStr)) {
                    e.preventDefault();
                    const id = appSettings.bookReaderPresetId;
                    if (id) {
                        dispatch(updateBookPreset({ id, data: appSettings.epubReaderSettings }));
                        setShortcutText(`已保存到预设“${currentPresetName ?? "未知"}”`);
                    }
                }
            };
            window.addEventListener("keydown", f);
            return () => window.removeEventListener("keydown", f);
        }, [
            isReaderSettingsOpen,
            shortcutsMapped,
            appSettings.bookReaderPresetId,
            appSettings.epubReaderSettings,
            currentPresetName,
            dispatch,
            setShortcutText,
            readerRef,
        ]);
        return (
            <div
                id="epubReaderSettings"
                className={
                    "readerSettings " +
                    (isReaderSettingsOpen ? "" : "closed ") +
                    (appSettings.checkboxReaderSetting ? "checkboxSetting " : "")
                }
                onKeyDown={(e) => {
                    if (e.key === "Escape" || e.key === "q") {
                        e.stopPropagation();
                        setReaderSettingOpen(false);
                        if (readerRef.current) readerRef.current.focus();
                    }
                }}
            >
                <button
                    className="menuExtender"
                    ref={readerSettingExtender}
                    onClick={() => setReaderSettingOpen((init) => !init)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape" || e.key === "q") e.currentTarget.blur();
                    }}
                    {...(!isReaderSettingsOpen ? { "data-tooltip": "阅读器设置" } : {})}
                >
                    <FontAwesomeIcon icon={isReaderSettingsOpen ? faTimes : faBars} />
                </button>
                <div className="main">
                    <ReaderPresetSection type="book" />
                    <div className="settingItem">
                        <div
                            className={
                                "name " +
                                (!appSettings.epubReaderSettings.settingsCollapsed.size ? "expanded " : "")
                            }
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") e.currentTarget.click();
                            }}
                            onClick={() => {
                                dispatch(
                                    setEpubReaderSettings({
                                        settingsCollapsed: {
                                            ...appSettings.epubReaderSettings.settingsCollapsed,
                                            size: !appSettings.epubReaderSettings.settingsCollapsed.size,
                                        },
                                    }),
                                );
                            }}
                        >
                            尺寸
                        </div>
                        <div className="options">
                            <InputNumber
                                value={appSettings.epubReaderSettings.readerWidth}
                                min={1}
                                max={maxWidth}
                                // onChange={(e) => {
                                // makeScrollPos();
                                // }}
                                timeout={[
                                    1000,
                                    (value) => dispatch(setEpubReaderSettings({ readerWidth: value })),
                                ]}
                                labelAfter="%"
                            />
                            <button
                                ref={sizeMinusRef}
                                onClick={(e) => {
                                    // makeScrollPos();
                                    // was 20 before
                                    const steps = appSettings.epubReaderSettings.readerWidth <= 40 ? 5 : 10;
                                    const readerWidth =
                                        appSettings.epubReaderSettings.readerWidth - steps > maxWidth
                                            ? maxWidth
                                            : appSettings.epubReaderSettings.readerWidth - steps < 1
                                              ? 1
                                              : appSettings.epubReaderSettings.readerWidth - steps;
                                    if (document.activeElement !== e.currentTarget)
                                        setShortcutText(`${readerWidth}%`);
                                    dispatch(setEpubReaderSettings({ readerWidth }));
                                    // e.currentTarget.dispatchEvent(new MouseEvent(type:"")))
                                }}
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <button
                                ref={sizePlusRef}
                                onClick={(e) => {
                                    // makeScrollPos();
                                    const steps = appSettings.epubReaderSettings.readerWidth <= 40 ? 5 : 10;
                                    const readerWidth =
                                        appSettings.epubReaderSettings.readerWidth + steps > maxWidth
                                            ? maxWidth
                                            : appSettings.epubReaderSettings.readerWidth + steps < 1
                                              ? 1
                                              : appSettings.epubReaderSettings.readerWidth + steps;

                                    if (document.activeElement !== e.currentTarget)
                                        setShortcutText(`${readerWidth}%`);
                                    dispatch(setEpubReaderSettings({ readerWidth }));
                                }}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <div className="col">
                                <InputCheckbox
                                    checked={appSettings.epubReaderSettings.limitImgHeight}
                                    onChange={(e) => {
                                        // makeScrollPos();
                                        dispatch(
                                            setEpubReaderSettings({
                                                limitImgHeight: e.currentTarget.checked,
                                            }),
                                        );
                                    }}
                                    paraAfter="限制图片高度不超过视口"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="settingItem">
                        <div
                            className={
                                "name " +
                                (!appSettings.epubReaderSettings.settingsCollapsed.font ? "expanded " : "")
                            }
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") e.currentTarget.click();
                            }}
                            onClick={() => {
                                dispatch(
                                    setEpubReaderSettings({
                                        settingsCollapsed: {
                                            ...appSettings.epubReaderSettings.settingsCollapsed,
                                            font: !appSettings.epubReaderSettings.settingsCollapsed.font,
                                        },
                                    }),
                                );
                            }}
                        >
                            字体与排版
                        </div>
                        <div className="options">
                            <div className="row">
                                <InputNumber
                                    value={appSettings.epubReaderSettings.fontSize}
                                    min={1}
                                    max={100}
                                    // onChange={(e) => {
                                    // makeScrollPos();
                                    // }}
                                    timeout={[
                                        1000,
                                        (value) => dispatch(setEpubReaderSettings({ fontSize: value })),
                                    ]}
                                    labelAfter="px"
                                />
                                <button
                                    ref={fontSizeMinusRef}
                                    onClick={(e) => {
                                        // makeScrollPos();
                                        let newSize = appSettings.epubReaderSettings.fontSize - 1;

                                        newSize = newSize < 1 ? 1 : newSize;
                                        if (document.activeElement !== e.currentTarget)
                                            setShortcutText(`${newSize}px`);
                                        dispatch(setEpubReaderSettings({ fontSize: newSize }));
                                    }}
                                >
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>
                                <button
                                    ref={fontSizePlusRef}
                                    onClick={(e) => {
                                        // makeScrollPos();
                                        let newSize = appSettings.epubReaderSettings.fontSize + 1;

                                        newSize = newSize > 100 ? 100 : newSize;
                                        if (document.activeElement !== e.currentTarget)
                                            setShortcutText(`${newSize}px`);
                                        dispatch(setEpubReaderSettings({ fontSize: newSize }));
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                            <div className="col">
                                <InputCheckbox
                                    checked={!appSettings.epubReaderSettings.useDefault_fontFamily}
                                    onChange={(e) => {
                                        // makeScrollPos();
                                        dispatch(
                                            setEpubReaderSettings({
                                                useDefault_fontFamily: !e.currentTarget.checked,
                                            }),
                                        );
                                    }}
                                    paraAfter="自定义字体"
                                />
                                <InputSelect
                                    disabled={appSettings.epubReaderSettings.useDefault_fontFamily}
                                    value={appSettings.epubReaderSettings.fontFamily}
                                    onChange={(value) => {
                                        // makeScrollPos();
                                        dispatch(
                                            setEpubReaderSettings({
                                                fontFamily: value,
                                            }),
                                        );
                                    }}
                                    options={[
                                        ...appSettings.epubReaderSettings.quickFontFamily.map(
                                            (e) =>
                                                ({
                                                    label: `★ ${e.replaceAll('"', "")}`,
                                                    value: e,
                                                    style: { fontFamily: e, fontSize: "1.2em" },
                                                }) as Menu.OptSelectOption,
                                        ),
                                        ...fontList.map(
                                            (e) =>
                                                ({
                                                    label: e.replaceAll('"', ""),
                                                    value: e,
                                                    style: { fontFamily: e, fontSize: "1.2em" },
                                                }) as Menu.OptSelectOption,
                                        ),
                                    ]}
                                />
                                <button
                                    disabled={appSettings.epubReaderSettings.useDefault_fontFamily}
                                    onClick={() => {
                                        if (
                                            appSettings.epubReaderSettings.quickFontFamily.includes(
                                                appSettings.epubReaderSettings.fontFamily,
                                            )
                                        ) {
                                            dispatch(
                                                setEpubReaderSettings({
                                                    quickFontFamily:
                                                        appSettings.epubReaderSettings.quickFontFamily.filter(
                                                            (e) => e !== appSettings.epubReaderSettings.fontFamily,
                                                        ),
                                                }),
                                            );
                                        } else {
                                            dispatch(
                                                setEpubReaderSettings({
                                                    quickFontFamily: [
                                                        ...appSettings.epubReaderSettings.quickFontFamily,
                                                        appSettings.epubReaderSettings.fontFamily,
                                                    ],
                                                }),
                                            );
                                        }
                                    }}
                                >
                                    {appSettings.epubReaderSettings.quickFontFamily.includes(
                                        appSettings.epubReaderSettings.fontFamily,
                                    )
                                        ? "取消常用"
                                        : "设为常用字体"}
                                </button>
                                <InputCheckbox
                                    checked={!appSettings.epubReaderSettings.useDefault_fontWeight}
                                    onChange={(e) => {
                                        dispatch(
                                            setEpubReaderSettings({
                                                useDefault_fontWeight: !e.currentTarget.checked,
                                            }),
                                        );
                                    }}
                                    title="仅在字体支持时生效"
                                    paraAfter="字重"
                                />
                                <InputRange
                                    value={appSettings.epubReaderSettings.fontWeight}
                                    disabled={appSettings.epubReaderSettings.useDefault_fontWeight}
                                    min={100}
                                    max={900}
                                    step={100}
                                    labeled
                                    labelText=""
                                    timeout={[
                                        350,
                                        (value) =>
                                            dispatch(
                                                setEpubReaderSettings({
                                                    fontWeight: value,
                                                }),
                                            ),
                                    ]}
                                />
                                <InputCheckboxNumber
                                    checked={!appSettings.epubReaderSettings.useDefault_lineSpacing}
                                    onChangeCheck={(e) => {
                                        // makeScrollPos();
                                        dispatch(
                                            setEpubReaderSettings({
                                                useDefault_lineSpacing: !e.currentTarget.checked,
                                            }),
                                        );
                                    }}
                                    step={0.1}
                                    min={0}
                                    max={10}
                                    value={appSettings.epubReaderSettings.lineSpacing}
                                    timeout={[
                                        1000,
                                        (value) => dispatch(setEpubReaderSettings({ lineSpacing: value })),
                                    ]}
                                    paraBefore="行高&nbsp;:"
                                    paraAfter="em"
                                />
                                <InputCheckboxNumber
                                    checked={!appSettings.epubReaderSettings.useDefault_paragraphSpacing}
                                    onChangeCheck={(e) => {
                                        // makeScrollPos();
                                        dispatch(
                                            setEpubReaderSettings({
                                                useDefault_paragraphSpacing: !e.currentTarget.checked,
                                            }),
                                        );
                                    }}
                                    step={0.1}
                                    min={0}
                                    max={10}
                                    value={appSettings.epubReaderSettings.paragraphSpacing}
                                    timeout={[
                                        1000,
                                        (value) => dispatch(setEpubReaderSettings({ paragraphSpacing: value })),
                                    ]}
                                    paraBefore="段落间距&nbsp;:"
                                    paraAfter="em"
                                />
                                <InputCheckboxNumber
                                    checked={!appSettings.epubReaderSettings.useDefault_wordSpacing}
                                    onChangeCheck={(e) => {
                                        dispatch(
                                            setEpubReaderSettings({
                                                useDefault_wordSpacing: !e.currentTarget.checked,
                                            }),
                                        );
                                    }}
                                    step={0.1}
                                    min={-1}
                                    max={5}
                                    value={appSettings.epubReaderSettings.wordSpacing}
                                    timeout={[
                                        1000,
                                        (value) => dispatch(setEpubReaderSettings({ wordSpacing: value })),
                                    ]}
                                    paraBefore="词间距&nbsp;:"
                                    paraAfter="em"
                                />
                                <InputCheckboxNumber
                                    checked={!appSettings.epubReaderSettings.useDefault_letterSpacing}
                                    onChangeCheck={(e) => {
                                        dispatch(
                                            setEpubReaderSettings({
                                                useDefault_letterSpacing: !e.currentTarget.checked,
                                            }),
                                        );
                                    }}
                                    step={0.01}
                                    min={-1}
                                    max={1}
                                    value={appSettings.epubReaderSettings.letterSpacing}
                                    timeout={[
                                        1000,
                                        (value) => dispatch(setEpubReaderSettings({ letterSpacing: value })),
                                    ]}
                                    paraBefore="字间距&nbsp;:"
                                    paraAfter="em"
                                />

                                <InputCheckbox
                                    checked={!appSettings.epubReaderSettings.noIndent}
                                    onChange={(e) => {
                                        dispatch(setEpubReaderSettings({ noIndent: !e.currentTarget.checked }));
                                    }}
                                    paraAfter="首行缩进"
                                />
                                {/* <InputCheckbox
                                    checked={appSettings.epubReaderSettings.hyphenation}
                                    onChange={(e) => {
                                        dispatch(setEpubReaderSettings({ hyphenation: e.currentTarget.checked }));
                                    }}
                                    paraAfter="Hyphenation"
                                /> */}
                            </div>
                        </div>
                    </div>
                    <div className="settingItem">
                        <div
                            className={
                                "name " +
                                (!appSettings.epubReaderSettings.settingsCollapsed.styles ? "expanded " : "")
                            }
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") e.currentTarget.click();
                            }}
                            onClick={() => {
                                dispatch(
                                    setEpubReaderSettings({
                                        settingsCollapsed: {
                                            ...appSettings.epubReaderSettings.settingsCollapsed,
                                            styles: !appSettings.epubReaderSettings.settingsCollapsed.styles,
                                        },
                                    }),
                                );
                            }}
                        >
                            样式与其他
                        </div>
                        <div className="options col">
                            <InputCheckboxColor
                                checked={!appSettings.epubReaderSettings.useDefault_fontColor}
                                onChangeCheck={(e) => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            useDefault_fontColor: !e.currentTarget.checked,
                                        }),
                                    );
                                }}
                                value={colorUtils.new(appSettings.epubReaderSettings.fontColor)}
                                timeout={[
                                    500,
                                    (value) =>
                                        dispatch(
                                            setEpubReaderSettings({
                                                fontColor: value.hexa(),
                                            }),
                                        ),
                                ]}
                                paraBefore="字体颜色&nbsp;:"
                            />
                            <InputCheckboxColor
                                checked={!appSettings.epubReaderSettings.useDefault_linkColor}
                                onChangeCheck={(e) => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            useDefault_linkColor: !e.currentTarget.checked,
                                        }),
                                    );
                                }}
                                value={colorUtils.new(appSettings.epubReaderSettings.linkColor)}
                                timeout={[
                                    500,
                                    (value) =>
                                        dispatch(
                                            setEpubReaderSettings({
                                                linkColor: value.hexa(),
                                            }),
                                        ),
                                ]}
                                paraBefore="链接颜色&nbsp;:"
                            />
                            <InputCheckboxColor
                                checked={!appSettings.epubReaderSettings.useDefault_backgroundColor}
                                onChangeCheck={(e) => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            useDefault_backgroundColor: !e.currentTarget.checked,
                                        }),
                                    );
                                }}
                                value={colorUtils.new(appSettings.epubReaderSettings.backgroundColor)}
                                timeout={[
                                    500,
                                    (value) =>
                                        dispatch(
                                            setEpubReaderSettings({
                                                backgroundColor: value.hexa(),
                                            }),
                                        ),
                                ]}
                                paraBefore="页面背景色&nbsp;:"
                            />
                            <InputCheckbox
                                checked={appSettings.epubReaderSettings.overrideEpubColors}
                                onChange={(e) => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            overrideEpubColors: e.currentTarget.checked,
                                        }),
                                    );
                                }}
                                title="当下方颜色被自定义（非默认）时，覆盖书籍中的对应样式以应用你的选择。"
                                paraAfter="覆盖 EPUB 内置颜色"
                            />
                            <InputCheckboxColor
                                checked={!appSettings.epubReaderSettings.useDefault_progressBackgroundColor}
                                onChangeCheck={(e) => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            useDefault_progressBackgroundColor: !e.currentTarget.checked,
                                        }),
                                    );
                                }}
                                value={colorUtils.new(appSettings.epubReaderSettings.progressBackgroundColor)}
                                timeout={[
                                    500,
                                    (value) =>
                                        dispatch(
                                            setEpubReaderSettings({
                                                progressBackgroundColor: value.hexa(),
                                            }),
                                        ),
                                ]}
                                paraBefore="进度背景色&nbsp;:"
                            />
                            <InputCheckbox
                                checked={appSettings.epubReaderSettings.forceLowBrightness.enabled}
                                onChange={(e) => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            forceLowBrightness: {
                                                ...appSettings.epubReaderSettings.forceLowBrightness,
                                                enabled: e.currentTarget.checked,
                                            },
                                        }),
                                    );
                                }}
                                paraAfter="强制降低亮度"
                            />
                            <InputRange
                                className={"colorRange"}
                                min={0}
                                max={0.9}
                                step={0.05}
                                value={appSettings.epubReaderSettings.forceLowBrightness.value}
                                disabled={!appSettings.epubReaderSettings.forceLowBrightness.enabled}
                                labeled={true}
                                timeout={[
                                    350,
                                    (value) =>
                                        dispatch(
                                            setEpubReaderSettings({
                                                forceLowBrightness: {
                                                    ...appSettings.epubReaderSettings.forceLowBrightness,
                                                    value,
                                                },
                                            }),
                                        ),
                                ]}
                            />
                            <InputCheckbox
                                checked={appSettings.epubReaderSettings.invertImageColor}
                                onChange={(e) => {
                                    dispatch(setEpubReaderSettings({ invertImageColor: e.currentTarget.checked }));
                                }}
                                title="让装饰图片更好地融入背景"
                                paraAfter="反色并混合图片颜色"
                            />
                            <InputCheckbox
                                checked={appSettings.epubReaderSettings.showProgressInZenMode}
                                onChange={(e) => {
                                    dispatch(
                                        setEpubReaderSettings({ showProgressInZenMode: e.currentTarget.checked }),
                                    );
                                }}
                                paraAfter="在 Zen Mode 中显示进度"
                            />
                        </div>
                    </div>
                    <ContentFrameSettings />
                    <BackgroundSettings />
                    <div className="settingItem">
                        <div
                            className={
                                "name " +
                                (!appSettings.epubReaderSettings.settingsCollapsed.scrollSpeed ? "expanded " : "")
                            }
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") e.currentTarget.click();
                            }}
                            onClick={() => {
                                dispatch(
                                    setEpubReaderSettings({
                                        settingsCollapsed: {
                                            ...appSettings.epubReaderSettings.settingsCollapsed,
                                            scrollSpeed:
                                                !appSettings.epubReaderSettings.settingsCollapsed.scrollSpeed,
                                        },
                                    }),
                                );
                            }}
                            title="使用按键滚动时的速度。"
                        >
                            滚动速度
                        </div>
                        <div className="options">
                            <InputNumber
                                value={appSettings.epubReaderSettings.scrollSpeedA}
                                min={1}
                                max={500}
                                timeout={[
                                    1000,
                                    (value) => dispatch(setEpubReaderSettings({ scrollSpeedA: value })),
                                ]}
                                labelBefore=" 滚动&nbsp;A&nbsp;:"
                                labelAfter="px"
                            />
                            <InputNumber
                                value={appSettings.epubReaderSettings.scrollSpeedB}
                                min={1}
                                max={500}
                                timeout={[
                                    1000,
                                    (value) => dispatch(setEpubReaderSettings({ scrollSpeedB: value })),
                                ]}
                                labelBefore=" 滚动&nbsp;B&nbsp;:"
                                labelAfter="px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

export default EPUBReaderSettings;
