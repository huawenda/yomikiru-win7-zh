import { setEpubReaderSettings } from "@store/appSettings";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import InputCheckbox from "@ui/InputCheckbox";
import InputColor from "@ui/InputColor";
import InputRange from "@ui/InputRange";
import { colorUtils } from "@utils/color";
import { promptSelectDir } from "@utils/file";
import { defaultSettings } from "@utils/settingsSchema";
import { memo } from "react";

const BackgroundSettings = memo(() => {
    const appSettings = useAppSelector((store) => store.appSettings);
    const dispatch = useAppDispatch();

    return (
        <div className="settingItem">
            <div
                className={`name ${!appSettings.epubReaderSettings.settingsCollapsed.background ? "expanded " : ""}`}
                onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") e.currentTarget.click();
                }}
                onClick={() => {
                    dispatch(
                        setEpubReaderSettings({
                            settingsCollapsed: {
                                ...appSettings.epubReaderSettings.settingsCollapsed,
                                background: !appSettings.epubReaderSettings.settingsCollapsed.background,
                            },
                        }),
                    );
                }}
            >
                背景图片
            </div>
            <div className="options col">
                <InputCheckbox
                    checked={appSettings.epubReaderSettings.backgroundImage.enabled}
                    onChange={(e) => {
                        dispatch(
                            setEpubReaderSettings({
                                backgroundImage: {
                                    ...appSettings.epubReaderSettings.backgroundImage,
                                    enabled: e.currentTarget.checked,
                                },
                            }),
                        );
                    }}
                    labelAfter="使用背景图片"
                />
                {appSettings.epubReaderSettings.backgroundImage.enabled && (
                    <>
                        <div className="row">
                            <input
                                type="text"
                                placeholder="未选择图片"
                                value={appSettings.epubReaderSettings.backgroundImage.path}
                                readOnly
                            />
                        </div>
                        <div className="row">
                            <button
                                onClick={() => {
                                    promptSelectDir(
                                        (path) => {
                                            dispatch(
                                                setEpubReaderSettings({
                                                    backgroundImage: {
                                                        ...appSettings.epubReaderSettings.backgroundImage,
                                                        path: path as string,
                                                    },
                                                }),
                                            );
                                        },
                                        true,
                                        [
                                            {
                                                extensions: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
                                                name: "图片",
                                            },
                                        ],
                                    );
                                }}
                            >
                                选择
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            backgroundImage: {
                                                ...appSettings.epubReaderSettings.backgroundImage,
                                                path: "",
                                            },
                                        }),
                                    );
                                }}
                            >
                                清除
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(
                                        setEpubReaderSettings({
                                            backgroundImage: {
                                                ...defaultSettings.epubReaderSettings.backgroundImage,
                                                enabled: appSettings.epubReaderSettings.backgroundImage.enabled,
                                            },
                                        }),
                                    );
                                }}
                            >
                                重置
                            </button>
                        </div>
                        <InputRange
                            min={0}
                            max={100}
                            step={5}
                            value={appSettings.epubReaderSettings.backgroundImage.dimIntensity}
                            labeled
                            labelText="变暗强度"
                            timeout={[
                                350,
                                (value) =>
                                    dispatch(
                                        setEpubReaderSettings({
                                            backgroundImage: {
                                                ...appSettings.epubReaderSettings.backgroundImage,
                                                dimIntensity: value,
                                            },
                                        }),
                                    ),
                            ]}
                        />
                        <InputRange
                            min={50}
                            max={150}
                            step={5}
                            value={appSettings.epubReaderSettings.backgroundImage.brightness}
                            labeled
                            labelText="亮度"
                            timeout={[
                                350,
                                (value) =>
                                    dispatch(
                                        setEpubReaderSettings({
                                            backgroundImage: {
                                                ...appSettings.epubReaderSettings.backgroundImage,
                                                brightness: value,
                                            },
                                        }),
                                    ),
                            ]}
                        />
                        <InputRange
                            min={50}
                            max={150}
                            step={5}
                            value={appSettings.epubReaderSettings.backgroundImage.contrast}
                            labeled
                            labelText="对比度"
                            timeout={[
                                350,
                                (value) =>
                                    dispatch(
                                        setEpubReaderSettings({
                                            backgroundImage: {
                                                ...appSettings.epubReaderSettings.backgroundImage,
                                                contrast: value,
                                            },
                                        }),
                                    ),
                            ]}
                        />
                        <InputCheckbox
                            checked={appSettings.epubReaderSettings.backgroundImage.layer.enabled}
                            onChange={(e) => {
                                dispatch(
                                    setEpubReaderSettings({
                                        backgroundImage: {
                                            ...appSettings.epubReaderSettings.backgroundImage,
                                            layer: {
                                                ...appSettings.epubReaderSettings.backgroundImage.layer,
                                                enabled: e.currentTarget.checked,
                                            },
                                        },
                                    }),
                                );
                            }}
                            labelAfter="图片图层叠加"
                        />

                        <InputColor
                            labeled
                            disabled={!appSettings.epubReaderSettings.backgroundImage.layer.enabled}
                            value={colorUtils.new(appSettings.epubReaderSettings.backgroundImage.layer.color)}
                            timeout={[
                                500,
                                (value) =>
                                    dispatch(
                                        setEpubReaderSettings({
                                            backgroundImage: {
                                                ...appSettings.epubReaderSettings.backgroundImage,
                                                layer: {
                                                    ...appSettings.epubReaderSettings.backgroundImage.layer,
                                                    color: value.hexa(),
                                                },
                                            },
                                        }),
                                    ),
                            ]}
                            paraBefore="图层颜色&nbsp;:"
                        />
                        <InputRange
                            min={0}
                            max={1}
                            step={0.05}
                            disabled={!appSettings.epubReaderSettings.backgroundImage.layer.enabled}
                            value={appSettings.epubReaderSettings.backgroundImage.layer.opacity}
                            labeled
                            labelText="图层不透明度"
                            timeout={[
                                350,
                                (value) =>
                                    dispatch(
                                        setEpubReaderSettings({
                                            backgroundImage: {
                                                ...appSettings.epubReaderSettings.backgroundImage,
                                                layer: {
                                                    ...appSettings.epubReaderSettings.backgroundImage.layer,
                                                    opacity: value,
                                                },
                                            },
                                        }),
                                    ),
                            ]}
                        />
                    </>
                )}
            </div>
        </div>
    );
});

BackgroundSettings.displayName = "BackgroundSettings";

export default BackgroundSettings;
