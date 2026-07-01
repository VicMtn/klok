# Klok

> A minimal time tracking app for macOS.

![Tauri](https://img.shields.io/badge/Tauri_v2-24C8D8?style=flat&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5.8-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

## Screenshots

| Weekly view | Special Days |
|---|---|
| ![Weekly view](screenshots/normal_week.png) | ![Specials Days](screenshots/special_days.png) |

| Vacation & Overtime | Statistics |
|---|---|
| ![Vacation tracking](screenshots/vacation.png) | ![Statistics](screenshots/statistics.png) |

## Features

- **Week and month views** — arrival, break start/end, departure, net hours, balance per day
- **Public holidays** — mark any day as a holiday; it counts toward your expected hours automatically
- **Vacation tracking** — dedicated page modelled on the Swiss system (4, 5 or 6 weeks per year: 20 / 25 / 30 days); mark any day as a vacation day from the row menu and it counts toward your expected hours
- **Overtime recovery** — take a day off drawn from your accumulated overtime; it deducts a day from your balance instead of counting against your annual vacation allocation, and the vacation page surfaces your remaining overtime balance
- **Sick days** — mark any day as a sick day; it credits your expected hours like a paid day, stays neutral to your balance, and is tracked separately with no annual cap
- **Per-row dropdown** — a single ⋮ button in each day row lets you mark a day as holiday, vacation, overtime recovery or sick, each colour-coded in the table
- **Statistics page** — weekly bar chart for the current year, with total hours, worked days, balance, weekly average, vacation taken / remaining, and sick days taken
- **Expected hours per week** — configurable target (default 37.5h), used to compute daily and weekly balance
- **Notes** per day entry
- **i18n** — French / English, switchable from the sidebar
- **Dark mode** — toggle in the sidebar, persisted across sessions
- **Print** week or month to PDF via the native print dialog
- **SQLite** — all data stored locally in `~/Library/Application Support/com.klok.app`
- Runs quietly in the menu bar; closing the window keeps it alive in the background

## Stack

| | |
|---|---|
| [Tauri v2](https://tauri.app) | Rust backend, WebKit renderer |
| React 19 + TypeScript | UI |
| Tailwind CSS v4 | Styling |
| Zustand | State management |
| `tauri-plugin-sql` | SQLite access |
| MUI X Charts | Statistics chart |

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
