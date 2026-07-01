import Database from "@tauri-apps/plugin-sql";
import type { TimeEntry, Holiday, Vacation, VacationType, SickDay } from "../types/entry";

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

export async function getVacationsForRange(start: string, end: string): Promise<Vacation[]> {
  return (await db()).select<Vacation[]>(
    "SELECT * FROM vacations WHERE date >= $1 AND date <= $2 ORDER BY date",
    [start, end]
  );
}

export async function getVacationsForYear(year: number): Promise<Vacation[]> {
  return (await db()).select<Vacation[]>(
    "SELECT * FROM vacations WHERE date LIKE $1 ORDER BY date",
    [`${year}-%`]
  );
}

export async function upsertVacation(
  date: string,
  type: VacationType = "paid"
): Promise<void> {
  await (await db()).execute(
    `INSERT INTO vacations (date, type) VALUES ($1, $2)
     ON CONFLICT(date) DO UPDATE SET type = $2`,
    [date, type]
  );
}

export async function deleteVacation(date: string): Promise<void> {
  await (await db()).execute(
    "DELETE FROM vacations WHERE date = $1",
    [date]
  );
}

export async function getSickDaysForRange(start: string, end: string): Promise<SickDay[]> {
  return (await db()).select<SickDay[]>(
    "SELECT * FROM sick_days WHERE date >= $1 AND date <= $2 ORDER BY date",
    [start, end]
  );
}

export async function getSickDaysForYear(year: number): Promise<SickDay[]> {
  return (await db()).select<SickDay[]>(
    "SELECT * FROM sick_days WHERE date LIKE $1 ORDER BY date",
    [`${year}-%`]
  );
}

export async function upsertSickDay(date: string): Promise<void> {
  await (await db()).execute(
    "INSERT OR IGNORE INTO sick_days (date) VALUES ($1)",
    [date]
  );
}

export async function deleteSickDay(date: string): Promise<void> {
  await (await db()).execute(
    "DELETE FROM sick_days WHERE date = $1",
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
