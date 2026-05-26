# Klok

A minimal time tracking app for macOS, built with Tauri v2 and React.

## Features

- **Week and month views** — arrival, break start/end, departure, net hours, balance per day
- **Public holidays** — mark any day as a holiday; it counts toward your expected hours automatically
- **Statistics page** — weekly bar chart for the current year, with total hours, worked days, balance, and weekly average
- **Expected hours per week** — configurable target (default 37.5h), used to compute daily and weekly balance
- **Notes** per day entry
- **Dark mode** — toggle in the sidebar, persisted across sessions
- **Print** week or month to PDF via the native print dialog
- **SQLite** — all data stored locally in `~/Library/Application Support/com.klok.app`
- Runs quietly in the menu bar; closing the window keeps it alive in the background

## Stack

- [Tauri v2](https://tauri.app) — Rust backend, WebKit renderer
- React 19 + TypeScript + Tailwind CSS v4
- Zustand — state management
- `tauri-plugin-sql` — SQLite access
- MUI X Charts — statistics visualisation

## Development

```bash
npm install
npm start          # launches tauri dev + vite HMR on :1420
```

Requires [Rust](https://rustup.rs) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform.

## Build

```bash
npm run build        # tsc + vite bundle
npm run tauri build  # produces .app / .dmg in src-tauri/target/release/bundle
```
