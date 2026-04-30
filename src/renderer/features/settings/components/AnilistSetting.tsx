import { setAnilistToken } from "@store/anilist";
import { setReaderSettings } from "@store/appSettings";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { setAnilistLoginOpen } from "@store/ui";
import InputCheckbox from "@ui/InputCheckbox";
import AniList from "@utils/anilist";
import { useEffect, useState } from "react";
import { useSettingsContext } from "../Settings";

const AnilistSetting: React.FC = () => {
    const { scrollIntoView } = useSettingsContext();
    const appSettings = useAppSelector((store) => store.appSettings);
    const [anilistUsername, setAnilistUsername] = useState("错误");
    const anilistToken = useAppSelector((store) => store.anilist.token);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (anilistToken)
            AniList.getUserName().then((name) => {
                if (name) setAnilistUsername(name);
            });
    }, [anilistToken]);
    return (
        <div className="settingItem2">
            <h3>AniList</h3>
            <div className="desc">
                将 Yomikiru 连接到你的 AniList 账号。{" "}
                <a
                    onClick={() => {
                        scrollIntoView("#settings-usage-anilist", "extras");
                    }}
                >
                    更多信息
                </a>
                <br />
                注意：如果未连接 AniList，Yomikiru 除应用更新外不会使用互联网。
            </div>
            <div className="main row">
                <button
                    disabled={!!anilistToken}
                    onClick={() => {
                        dispatch(setAnilistLoginOpen(true));
                    }}
                >
                    {!anilistToken ? "使用 AniList 登录" : `已登录为 ${anilistUsername}`}
                </button>
                {anilistToken && (
                    <button
                        onClick={() => {
                            dispatch(setAnilistToken(""));
                        }}
                    >
                        退出登录
                    </button>
                )}
            </div>
            <div className="toggleItem">
                <InputCheckbox
                    checked={appSettings.readerSettings.autoUpdateAnilistProgress}
                    className="noBG"
                    onChange={(e) => {
                        dispatch(
                            setReaderSettings({
                                autoUpdateAnilistProgress: e.currentTarget.checked,
                            }),
                        );
                    }}
                    disabled={!anilistToken}
                    labelAfter="自动更新 AniList 进度"
                />
                <div className="desc">
                    当章节阅读超过 70% 时自动更新 AniList 进度。仅在章节名称格式良好时生效。
                </div>
            </div>
        </div>
    );
};

export default AnilistSetting;
