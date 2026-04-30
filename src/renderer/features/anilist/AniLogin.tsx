import { setAnilistToken } from "@store/anilist";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { setAnilistLoginOpen } from "@store/ui";
import AniList from "@utils/anilist";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import FocusLock from "react-focus-lock";

const AniLogin: React.FC = () => {
    const [proceeded, setProceeded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isAniLoginOpen = useAppSelector((store) => store.ui.isOpen.anilist.login);
    const contRef = useRef<HTMLDivElement>(null);

    const dispatch = useAppDispatch();
    useEffect(() => {
        if (isAniLoginOpen) {
            setTimeout(() => {
                contRef.current?.focus();
            }, 300);
        }
    }, [isAniLoginOpen]);

    useEffect(() => {
        setTimeout(() => {
            if (contRef.current) contRef.current.setAttribute("data-state", "open");
        }, 100);
    }, []);

    return (
        <FocusLock>
            <div
                id="anilistLogin"
                data-state="closed"
                ref={(node) => {
                    if (node) {
                        setTimeout(() => {
                            if (node) node.setAttribute("data-state", "open");
                        }, 100);
                    }
                }}
            >
                <div className="clickClose" onClick={() => dispatch(setAnilistLoginOpen(false))}></div>
                <div
                    className="overlayCont"
                    onKeyDown={(e) => {
                        if (e.key === "Escape") dispatch(setAnilistLoginOpen(false));
                    }}
                    tabIndex={-1}
                    ref={contRef}
                >
                    <h1>关联 AniList</h1>
                    <p>
                        点击“继续”开始授权流程。系统会跳转到你的默认浏览器。
                        <br /> <br />
                        授权完成后，AniList 会提供一个 token，将其复制并粘贴到下方即可完成关联。
                        <br /> <br />
                        更多信息可查看设置中的“使用说明与功能”，或在 GitHub 页面提问。
                    </p>
                    <div className="btns">
                        {!proceeded && (
                            <button
                                onClick={() => {
                                    window.electron.openExternal(
                                        "https://anilist.co/api/v2/oauth/authorize?client_id=13234&response_type=token",
                                    );
                                    setProceeded(true);
                                }}
                            >
                                继续
                            </button>
                        )}
                        {proceeded && (
                            <>
                                <input
                                    placeholder="在此粘贴 token"
                                    type="text"
                                    ref={inputRef}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                                <button
                                    className="submit"
                                    onClick={(e) => {
                                        if (inputRef.current) {
                                            const token = inputRef.current.value.trimEnd();
                                            const elem = e.currentTarget;
                                            elem.innerText = "正在检查...";
                                            AniList.checkToken(token).then((e) => {
                                                if (e) {
                                                    elem.innerText = "已关联！";
                                                    setTimeout(() => {
                                                        dispatch(setAnilistToken(token));
                                                        dispatch(setAnilistLoginOpen(false));
                                                    }, 1000);
                                                } else {
                                                    elem.innerText = "Token 无效 / 发生错误";
                                                    if (inputRef.current) inputRef.current.value = "";
                                                    setTimeout(() => {
                                                        elem.innerText = "提交";
                                                    }, 2000);
                                                }
                                            });
                                        }
                                    }}
                                >
                                    提交
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </FocusLock>
    );
};

export default AniLogin;
