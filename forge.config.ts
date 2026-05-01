import { MakerZIP } from "@electron-forge/maker-zip";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import type { ForgeConfig } from "@electron-forge/shared-types";
import packageJSON from "./package.json";
import { mainConfig } from "./webpack/webpack.main.config";
import { preloadConfig } from "./webpack/webpack.preload.config";
import { rendererConfig } from "./webpack/webpack.renderer.config";

const { productName: appName } = packageJSON;

const config: ForgeConfig = {
    packagerConfig: {
        name: appName,
        asar: true,
        // needed for migrating better-sqlite3
        extraResource: ["./drizzle", "./public/app.ico"],
        executableName: process.platform === "win32" ? appName : appName.toLowerCase(),
    },
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            devServer: {
                liveReload: false,
            },
            mainConfig,
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: "./public/index.html",
                        js: "./src/renderer/index.tsx",
                        name: "home",
                        preload: {
                            js: "./src/electron/preload.ts",
                            config: preloadConfig,
                        },
                    },
                ],
            },
            devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
        }),
    ],
    makers: [
        new MakerZIP({}, ["win32"]),
    ],
};

export default config;
