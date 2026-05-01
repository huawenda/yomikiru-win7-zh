import { useAppDispatch, useAppSelector } from "@store/hooks";
import { setTheme } from "@store/themes";

const GeneralThemeSettings: React.FC = () => {
    const theme = useAppSelector((store) => store.theme.name);
    const allThemes = useAppSelector((store) => store.theme.allData);
    const dispatch = useAppDispatch();

    return (
        <div className="settingItem2" id="settings-theme">
            <h3>主题</h3>
            <div className="main row">
                {allThemes.map((e) => (
                    <div className="themeButtons" key={e.name}>
                        <button
                            className={theme === e.name ? "selected" : ""}
                            onClick={() => dispatch(setTheme(e.name))}
                            title={e.name}
                        >
                            {e.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GeneralThemeSettings;
