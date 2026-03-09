# Eng Book Reader

Web-first ebook reader with local MOBI and AZW3/KF8 support.

## Features

- Local import for `.mobi` and `.azw3` files (up to 100MB)
- Bookshelf for multiple books with persistent progress
- Reader modes:
  - Continuous scroll
  - Global seamless pagination
- Search within book (chapter/global)
- Bookmarks
- Reader controls (font, line-height, padding, theme)
- Offline-capable PWA shell
- Tauri wrapper scaffold for Windows and Linux builds

## Stack

- React + TypeScript + Vite
- React Router
- Zustand
- Dexie (IndexedDB)
- `@lingo-reader/mobi-parser` in Web Worker
- MiniSearch
- Vitest + Testing Library
- Playwright (smoke)
- Tauri v2

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173/library`.

## Test

```bash
npx vitest run
```

E2E smoke:

```bash
npm run test:e2e
```

`npm run test:e2e` will use the repo fixtures `ebooks/Steve Jobs.mobi` and `ebooks/Steve Jobs.azw3` automatically when they are present.

To override the import fixtures explicitly:

```bash
E2E_MOBI_FILE=/abs/path/book.mobi npm run test:e2e
E2E_AZW3_FILE=/abs/path/book.azw3 npm run test:e2e
```

## Build

Web build:

```bash
npm run build
```

Desktop wrapper:

```bash
npm run tauri:dev
npm run tauri:build
```
