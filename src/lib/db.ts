import Database from "@tauri-apps/plugin-sql";
import type { TimeEntry, Holiday } from "../types/entry";

let _db: Database | null = null;

async function db(): Promise<Database> {
  if (!_db) _db = await Database.load("sqlite:klok.db");
  return _db;
}

export async function getEntriesForWeek(
  weekStart: string,
  weekEnd: string
): Promise<TimeEntry[]> {
  return (await db()).select<TimeEntry[]>(
    "SELECT * FROM time_entries WHERE date >= $1 AND date <= $2 ORDER BY date",
    [weekStart, weekEnd]
  );
}

export async function getEntriesForMonth(
  year: number,
  month: number
): Promise<TimeEntry[]> {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return (await db()).select<TimeEntry[]>(
    "SELECT * FROM time_entries WHERE date LIKE $1 ORDER BY date",
    [`${prefix}-%`]
  );
}

export async function getEntriesForYear(year: number): Promise<TimeEntry[]> {
  return (await db()).select<TimeEntry[]>(
    "SELECT * FROM time_entries WHERE date LIKE $1 ORDER BY date",
    [`${year}-%`]
  );
}

export async function updateEntryField(
  date: string,
  field: string,
  value: string | null
): Promise<void> {
  await (await db()).execute(
    `INSERT INTO time_entries (date, ${field}) VALUES ($1, $2)
     ON CONFLICT(date) DO UPDATE SET ${field} = $2`,
    [date, value]
  );
}

export async function getHolidaysForRange(start: string, end: string): Promise<Holiday[]> {
  return (await db()).select<Holiday[]>(
    "SELECT * FROM holidays WHERE date >= $1 AND date <= $2 ORDER BY date",
    [start, end]
  );
}

export async function getHolidaysForYear(year: number): Promise<Holiday[]> {
  return (await db()).select<Holiday[]>(
    "SELECT * FROM holidays WHERE date LIKE $1 ORDER BY date",
    [`${year}-%`]
  );
}

export async function upsertHoliday(date: string, label: string | null): Promise<void> {
  await (await db()).execute(
    "INSERT OR REPLACE INTO holidays (date, label) VALUES ($1, $2)",
    [date, label]
  );
}

export async function deleteHoliday(date: string): Promise<void> {
  await (await db()).execute(
    "DELETE FROM holidays WHERE date = $1",
    [date]
  );
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await (await db()).select<{ key: string; value: string }[]>(
    "SELECT key, value FROM settings"
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSetting(key: string, value: string): Promise<void> {
  await (await db()).execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
    [key, value]
  );
}
