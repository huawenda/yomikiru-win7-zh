# 项目文档

本文档面向希望理解、维护或扩展 Yomikiru 的开发者。用户使用说明请参见 [User Guide](./GUIDE.md)，本地构建和打包步骤请参见 [Build Guide](./build.md)。

## 项目概览

Yomikiru 是一个离线桌面阅读器，主要用于阅读本地漫画、Webtoon、漫画压缩包、PDF 和 EPUB 小说。项目基于 Electron、React、TypeScript、Redux Toolkit、Drizzle ORM 和 SQLite 构建。

核心能力包括：

- 本地文件夹、图片、压缩包、PDF、EPUB 的阅读。
- 阅读进度、历史、书签和 EPUB 笔记的持久化。
- 多窗口、拖放打开。
- 自定义主题、阅读器预设、快捷键和应用设置。
- Electron Forge 打包 Windows 7 32位便携版。

## 技术栈

| 类型 | 主要依赖 |
| --- | --- |
| 桌面运行时 | Electron 22、Electron Forge |
| 前端 | React 17、React DOM、SCSS |
| 状态管理 | Redux Toolkit、React Redux |
| 数据库 | better-sqlite3、Drizzle ORM、Drizzle Kit |
| 文件与系统能力 | Electron IPC、preload bridge |
| 格式与阅读 | pdfjs-dist、自定义 EPUB/漫画解析工具 |
| 代码质量 | TypeScript、Biome、ESLint、Husky、lint-staged |

## 目录结构

```text
.
├─ docs/                 项目文档、用户指南、构建指南
├─ drizzle/              SQLite 数据库迁移文件和快照
├─ public/               Electron/webpack 使用的静态资源
├─ src/
│  ├─ common/            主进程和渲染进程共享的类型与日志模块
│  ├─ electron/          Electron 主进程、preload、IPC、数据库、窗口工具
│  └─ renderer/          React 应用、功能模块、共享 API/平台适配、Redux store、样式和工具
├─ webpack/              Electron Forge webpack 配置
├─ forge.config.ts       Electron Forge 打包配置
├─ drizzle.config.ts     Drizzle Kit 配置
├─ package.json          脚本、依赖和发布配置
└─ tsconfig.json         TypeScript 配置和路径别名
```

## 运行流程

1. Electron 启动主进程入口 `src/electron/main.ts`。
2. 主进程初始化错误处理、SQLite 数据库、应用菜单、窗口管理和 IPC handlers。
3. `WindowManager.createWindow` 创建 BrowserWindow，并加载 webpack 构建后的渲染进程资源。
4. `src/electron/preload.ts` 通过 `contextBridge` 向渲染进程暴露受控 API，例如 `window.electron`、`window.fs`、`window.path`。
5. React 入口加载 Redux store，`App.tsx` 初始化设置、主题、书签、笔记、阅读历史和 IPC 监听。
6. `Main.tsx` 根据当前 reader 状态渲染首页、设置、漫画阅读器和 EPUB 阅读器。

## 主进程

主进程代码位于 `src/electron/`。

重要文件：

- `main.ts`：应用生命周期入口，负责初始化数据库、IPC、窗口和菜单。
- `preload.ts`：隔离主进程能力和渲染进程 UI，暴露文件系统、Electron、路径、字体、日志等 API。
- `db/index.ts`：`DatabaseService` 封装 Drizzle SQLite 连接、迁移和部分事务逻辑。
- `db/schema.ts`：数据库表结构，包括 library items、漫画进度、书籍进度、漫画书签、书籍书签和书籍笔记。
- `ipc/*.ts`：按能力拆分的 IPC handler，例如数据库、文件系统、对话框。
- `ipc/database/`：数据库 IPC handler 按 library、manga、book、bookmarks、notes 拆分；外部仍通过 `setupDatabaseHandlers(db)` 统一注册。
- `ipc/broadcast.ts`：主进程向所有窗口广播数据库变更事件，例如 `db:library:change`。
- `util/window.ts`：窗口创建、窗口间通信、关闭和单实例相关逻辑。
- `util/mainSettings.ts`：主进程级别的应用设置。

主进程是数据库写入和系统能力的主要边界。渲染进程不直接访问数据库，而是通过 `window.electron.invoke(...)` 调用 IPC。

## 渲染进程

渲染进程代码位于 `src/renderer/`。

重要区域：

- `app/`：应用级编排层，包括顶层 Provider、主视图组合、启动同步、全局 IPC 监听、拖放打开、全局快捷键、右键菜单模板和阅读器生命周期。
- `features/home/`：主页和本地库列表。
- `features/reader/manga/`：漫画、图片文件夹、压缩包、PDF 阅读体验。
- `features/reader/epub/`：EPUB/文本阅读、目录、书签、笔记、查找等功能。
- `features/settings/`：应用设置、阅读器设置、主题、快捷键。
- `shared/api/`：渲染进程访问主进程能力的 typed API client，store thunk 和功能模块应优先通过这里调用 IPC。
- `shared/platform/`：平台边界适配，例如 `ipcClient` 对 `window.electron.invoke/send/on` 的轻量封装。
- `components/`：通用组件和基础 UI 控件。
- `utils/`：文件格式判断、EPUB/PDF 处理、快捷键、主题、对话框、日志等工具。
- `styles/`：全局 SCSS、组件样式、字体和图标资源。

新增代码建议遵循以下归属：

- 应用启动、全局事件、副作用编排放到 `renderer/app/hooks/`。
- 具体业务 UI 和局部逻辑放到对应 `renderer/features/*/`。
- 跨 feature 复用的主进程调用封装放到 `renderer/shared/api/`。
- 不要在新的 store thunk 或 feature 组件中直接拼接 IPC channel；优先新增 typed API 方法。

## 状态管理

Redux store 位于 `src/renderer/store/`，在 `store/index.ts` 统一注册 reducer。

主要 slice：

- `appSettings`：渲染进程应用设置，通常持久化到 `settings.json`。
- `mainSettings`：主进程设置，通过 IPC 同步。
- `reader`：当前阅读器状态，例如是否激活、类型、当前链接。
- `library`：本地库条目和阅读进度。
- `bookmarks`：漫画和书籍书签。
- `bookNotes`：EPUB 笔记。
- `readerPresets`：阅读器预设，并通过 `readerPresetsAutosaveMiddleware` 自动保存。
- `shortcuts`：快捷键配置。
- `themes`：主题配置和当前主题（localStorage 存储）。
- `ui`：设置面板、弹窗、菜单等 UI 开关。

应用启动时，`App.tsx` 会拉取数据库中的 library/bookmark/note 数据，并监听 `db:*:change` 事件来刷新对应 store。

## IPC 约定

IPC 类型定义集中在 `src/common/types/ipc.ts`。

项目使用 `ChannelDefinition<Req, Res, Dir>` 描述通道的请求、响应和方向：

- `r2m`：renderer to main，渲染进程调用主进程。
- `m2r`：main to renderer，主进程向窗口广播或发送事件。

渲染进程侧使用：

```ts
window.electron.invoke("db:library:getAllAndProgress");
window.electron.send("window:openLinkInNewWindow", link);
window.electron.on("db:library:change", () => {
    // refresh store
});
```

新增 IPC 时建议遵循以下步骤：

1. 在 `src/common/types/ipc.ts` 中声明通道类型。
2. 在对应的 `src/electron/ipc/*.ts` 文件中实现 handler。
3. 如果是数据库变更，必要时调用 `pingDatabaseChange(...)` 通知所有窗口刷新。
4. 在 `src/renderer/shared/api/` 中新增 typed API 方法。
5. 在渲染进程功能代码或 store thunk 中调用 API 方法，避免直接拼接 IPC channel。

## 数据库

数据库使用 SQLite，ORM 为 Drizzle。

数据位置：

- 开发环境：项目根目录下的 `data.db`。
- 生产环境：Electron `userData` 目录下的 `data.db`。
- Windows 便携模式：可跟随可执行文件附近的用户数据目录。

核心表：

| 表 | 说明 |
| --- | --- |
| `library_items` | 本地库条目，区分 `manga` 和 `book` |
| `manga_progress` | 漫画章节、页码、已读章节 |
| `book_progress` | EPUB 章节 ID、章节名和 CSS 位置 |
| `manga_bookmarks` | 漫画页书签 |
| `book_bookmarks` | EPUB 位置书签 |
| `book_notes` | EPUB 划线、颜色和笔记内容 |

常用数据库命令：

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
pnpm drizzle:push
pnpm drizzle:studio
```

修改 schema 时，应更新 `src/electron/db/schema.ts`，再生成迁移并验证旧数据升级路径。

## 配置与用户数据

渲染进程配置文件路径由 `src/renderer/utils/file.ts` 统一定义，基于 `window.electron.app.getPath("userData")`：

- `settings.json`：应用设置。
- `shortcuts.json`：快捷键。
- `reader-presets.json`：阅读器预设。
- `history.json`、`bookmarks.json`：旧版本遗留数据，当前主要由 SQLite 接管。

主题配置使用 localStorage 存储。

## 文件与阅读格式

格式判断集中在 `src/renderer/utils/file.ts`：

- 图片：`.jpg`、`.jpeg`、`.png`、`.webp`、`.svg`、`.apng`、`.gif`、`.avif`
- 压缩漫画：`.zip`、`.cbz`、`.7z`、`.cb7`、`.rar`、`.cbr`
- 文档与书籍：`.pdf`、`.epub`、`.xhtml`、`.html`、`.txt`

阅读器选择的大致规则：

- 文件夹或图片集合进入漫画阅读器。
- 压缩包先经文件系统 IPC 解包或读取后进入漫画阅读器。
- EPUB、HTML、TXT 进入书籍阅读器。
- PDF 进入 PDF/漫画式阅读流程。

目录有效性检查和打开逻辑主要在 `src/renderer/features/reader/services/directoryValidator.ts` 与 `hooks/useDirectoryValidator.ts`。

## 路径别名

`tsconfig.json` 定义了常用别名：

| 别名 | 目标 |
| --- | --- |
| `@common/*` | `src/common/*` |
| `@electron/*` | `src/electron/*` |
| `@app/*` | `src/renderer/app/*` |
| `@shared/*` | `src/renderer/shared/*` |
| `@renderer/*` | `src/renderer/*` |
| `@features/*` | `src/renderer/features/*` |
| `@store/*` | `src/renderer/store/*` |
| `@hooks/*` | `src/renderer/hooks/*` |
| `@utils/*` | `src/renderer/utils/*` |
| `@ui/*` | `src/renderer/components/ui/*` |
| `@renderer-types/*` | `src/renderer/types/*` |

新增模块时优先使用这些别名，保持 import 风格一致。

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 类型检查
pnpm tslint

# Biome 检查
pnpm biome:check

# Biome 自动修复
pnpm biome:fix

# 综合检查
pnpm check

# 打包当前平台
pnpm package
```

打包命令：

```bash
pnpm make:zip32   # 打包 Win7 32位便携版 ZIP
```

## 开发建议

- 修改数据库结构时，同时维护 Drizzle schema、迁移文件和 IPC 输入校验。
- 新增主进程能力时，优先通过 typed IPC 暴露，不要直接扩大 preload 中的系统 API 面。
- 修改阅读器行为时，注意漫画阅读器和 EPUB 阅读器的数据模型不同：漫画以页和章节路径为主，EPUB 以章节 ID 和 DOM/CSS 位置为主。
- 修改设置、快捷键或阅读器预设时，检查对应 JSON 文件的读写。
- 对用户数据执行删除、迁移、重置前，应保留备份或提供确认流程。

## 常见扩展点

### 新增设置项

1. 在设置 schema 或默认值中加入字段。
2. 在 `features/settings/` 中添加 UI 控件。
3. 如果设置影响阅读器或主页，连接对应 Redux slice。

### 新增数据库能力

1. 修改 `src/electron/db/schema.ts`。
2. 运行 `pnpm drizzle:generate` 生成迁移。
3. 在 `src/common/types/db.ts` 和 `src/common/types/ipc.ts` 中补充类型。
4. 在 `src/electron/ipc/database/` 对应领域文件中添加 handler。
5. 在 `src/renderer/shared/api/` 添加 typed API 方法。
6. 在对应 store slice 中添加 thunk/action。

### 新增阅读格式

1. 在 `formatUtils` 中加入扩展名判断。
2. 扩展目录或文件验证逻辑。
3. 在阅读器入口中选择合适的渲染组件。
4. 补充进度、书签或缓存策略。

### 新增快捷键

1. 更新快捷键默认配置和 schema。
2. 在 `App.tsx` 或具体阅读器 hook 中处理快捷键。
3. 在设置页快捷键组件中确认可编辑和可展示。

## 构建流程

```bash
pnpm check          # Biome + TypeScript 检查
pnpm check:chrome108 # Chrome 108 兼容性检查
pnpm make:zip32      # 打包 Win7 32位便携版
```

产物输出到 `./out` 目录。
