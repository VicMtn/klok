# Klok

A minimal time tracking app for macOS, built with Tauri v2 and React.

## Features

- **Stamp in/out** from the menu bar — arrival, break start/end, departure
- **Week and month views** with daily net hours and running balance
- **SQLite** — data stored locally in `~/Library/Application Support/com.klok.app`
- **Print** week or month to PDF via the native print dialog
- Runs quietly in the menu bar; closing the window keeps it alive in the background

## Stack

- [Tauri v2](https://tauri.app) — Rust backend, WebKit renderer
- React 19 + TypeScript + Tailwind CSS v4
- Zustand — state management
- `tauri-plugin-sql` — SQLite access

## Development

```bash
npm install
npm start          # launches tauri dev + vite HMR on :1420
```

Requires [Rust](https://rustup.rs) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform.

## Build

```bash
npm run build      # tsc + vite bundle
npm run tauri build  # produces .app / .dmg in src-tauri/target/release/bundle
```
