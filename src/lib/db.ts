import Database from "@tauri-apps/plugin-sql";
import type { TimeEntry, SpecialDay, SpecialDayType, ActivityPeriod } from "../types/entry";

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

export async function getSpecialDaysForRange(start: string, end: string): Promise<SpecialDay[]> {
  return (await db()).select<SpecialDay[]>(
    "SELECT * FROM special_days WHERE date >= $1 AND date <= $2 ORDER BY date",
    [start, end]
  );
}

export async function getSpecialDaysForYear(year: number): Promise<SpecialDay[]> {
  return (await db()).select<SpecialDay[]>(
    "SELECT * FROM special_days WHERE date LIKE $1 ORDER BY date",
    [`${year}-%`]
  );
}

// Set (or replace) the status of a date. A date holds exactly one type, so
// switching type or editing a holiday label both go through here.
export async function upsertSpecialDay(
  date: string,
  type: SpecialDayType,
  label: string | null = null
): Promise<void> {
  await (await db()).execute(
    `INSERT INTO special_days (date, type, label) VALUES ($1, $2, $3)
     ON CONFLICT(date) DO UPDATE SET type = $2, label = $3`,
    [date, type, label]
  );
}

export async function deleteSpecialDay(date: string): Promise<void> {
  await (await db()).execute(
    "DELETE FROM special_days WHERE date = $1",
    [date]
  );
}

export async function getActivityPeriods(): Promise<ActivityPeriod[]> {
  return (await db()).select<ActivityPeriod[]>(
    "SELECT effective_from, activity_rate, worked_days_per_week FROM activity_periods ORDER BY effective_from"
  );
}

export async function upsertActivityPeriod(
  effectiveFrom: string,
  activityRate: number,
  workedDaysPerWeek: number
): Promise<void> {
  await (await db()).execute(
    `INSERT INTO activity_periods (effective_from, activity_rate, worked_days_per_week) VALUES ($1, $2, $3)
     ON CONFLICT(effective_from) DO UPDATE SET activity_rate = $2, worked_days_per_week = $3`,
    [effectiveFrom, activityRate, workedDaysPerWeek]
  );
}

export async function deleteActivityPeriod(effectiveFrom: string): Promise<void> {
  await (await db()).execute(
    "DELETE FROM activity_periods WHERE effective_from = $1",
    [effectiveFrom]
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
