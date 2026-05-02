# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yomikiru is an offline desktop manga/comic/webtoon/EPUB reader built with **Electron 22 + React 17 + Redux Toolkit**. TypeScript strict mode, pnpm package manager.

## Commands

```bash
pnpm dev                  # Start dev server (Electron Forge + Webpack HMR)
pnpm package              # Build/package for current OS (output: ./out)
pnpm tslint               # TypeScript type check (tsc --noemit)
pnpm biome:check          # Run Biome linter + formatter checks
pnpm biome:fix            # Auto-fix Biome issues
pnpm lint                 # Biome lint only
pnpm check                # Biome check + TypeScript check
pnpm check:full           # Biome (error) + ESLint Chrome 108 + TypeScript
pnpm drizzle:generate     # Generate DB migrations from schema changes
pnpm drizzle:push         # Push schema to DB (dev only)
pnpm drizzle:migrate      # Apply migrations
pnpm drizzle:studio       # Open Drizzle Studio DB viewer
```

## Architecture

### Electron Process Separation

- **Main process** (`src/electron/`): App lifecycle, SQLite database, window management, IPC handlers. Entry: `main.ts`.
- **Preload** (`src/electron/preload.ts`): Exposes APIs via `contextBridge` — `window.electron`, `window.fs`, `window.path`, `window.process`, `window.logger`.
- **Renderer** (`src/renderer/`): React UI + Redux store. Never touches Node.js/Electron APIs directly.

### IPC Contract

All IPC channels are typed in `src/common/types/ipc.ts` using `ChannelDefinition<Req, Res, Dir>`. Main process registers handlers via wrapper functions in `src/electron/ipc/utils.ts` (never raw `ipcMain.handle`). Renderer calls `window.electron.invoke/send/on`.

### Database Layer

SQLite via `better-sqlite3` + Drizzle ORM. Schema at `src/electron/db/schema.ts`. All DB writes go through main process IPC handlers — renderer never touches SQLite directly. IPC inputs are validated using Zod schemas generated from Drizzle via `drizzle-zod` (`src/electron/db/validator.ts`).

### Renderer Feature Organization

```
src/renderer/
├── features/home/       Library/home page
├── features/reader/     Manga reader + EPUB reader + shared hooks/services
├── features/settings/   Settings panel
├── store/               Redux Toolkit slices
├── hooks/               Shared hooks (useKeyboardShortcuts, useKeybindings)
├── components/          Shared components + ui/ (Modal, InputSelect, etc.)
└── utils/               Utility modules (file, epub, pdf, theme, dialog)
```

Top-level routing in `Main.tsx` — conditionally renders `ClassicView`, `Settings`, `Reader`, `EPubReader`.

## Path Aliases (tsconfig.json)

`@common/*`, `@electron/*`, `@renderer/*`, `@features/*`, `@store/*`, `@hooks/*`, `@utils/*`, `@ui/*`, `@renderer-types/*`

## Key Conventions

- **Process isolation enforced by linting**: Biome rules forbid renderer from importing electron/node modules and main process from importing React.
- **Chrome 108 compatibility**: Electron 22 uses Chromium 108. Banned APIs: `Array.fromAsync`, `Object.groupBy`, `Promise.withResolvers`, `findLast`, `toReversed`, `toSorted`, `toSpliced`, `Array.with`.
- **`type` over `interface`** in TypeScript.
- **Formatting**: 4-space indent, LF line endings, 115-char line width, double quotes, trailing commas, semicolons always.
- **Static class pattern** for main process services (`WindowManager`, `MainSettings`, `DatabaseService`).
- **Legacy migration**: App migrates from JSON-based config/history to SQLite on first run.
- **UI strings**: Menu labels and dialogs are in Chinese.

## Git Hooks

- **Pre-commit**: `lint-staged` runs Biome check+fix on TS/JS files, format on JSON/CSS. Type-checks if TS files changed.
- **Pre-push**: On protected branches (main, master, develop, staging, beta), runs `pnpm run check:full`.
