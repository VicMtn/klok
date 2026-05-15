import type { TimeEntry, DayCalculation, Holiday } from "../types/entry";
import { timeToMinutes } from "./formatting";

export function calculateDay(entry: TimeEntry): DayCalculation {
  const arrival = entry.arrival ? timeToMinutes(entry.arrival) : null;
  const departure = entry.departure ? timeToMinutes(entry.departure) : null;
  const breakStart = entry.break_start ? timeToMinutes(entry.break_start) : null;
  const breakEnd = entry.break_end ? timeToMinutes(entry.break_end) : null;

  if (arrival === null || departure === null) {
    return { gross: 0, breakDuration: 0, net: 0, netDecimal: 0, isComplete: false };
  }

  const gross = departure - arrival;
  const breakDuration =
    breakStart !== null && breakEnd !== null && breakEnd > breakStart
      ? breakEnd - breakStart
      : 0;
  const net = Math.max(0, gross - breakDuration);
  const netDecimal = Math.round((net / 60) * 100) / 100;

  return { gross, breakDuration, net, netDecimal, isComplete: true };
}

export function calculateTotal(entries: TimeEntry[]): number {
  return entries.reduce((sum, e) => sum + calculateDay(e).netDecimal, 0);
}

export function calculateBalance(
  entries: TimeEntry[],
  expectedHoursPerDay: number,
  holidays: Holiday[] = []
): number {
  const holidayDates = new Set(holidays.map((h) => h.date));
  const nonHolidayEntries = entries.filter((e) => !holidayDates.has(e.date));
  const workedDays = nonHolidayEntries.filter((e) => calculateDay(e).isComplete).length;
  const expected = workedDays * expectedHoursPerDay;
  const actual = calculateTotal(nonHolidayEntries);
  return Math.round((actual - expected) * 100) / 100;
}

export function calculateTotalWithHolidays(
  entries: TimeEntry[],
  holidays: Holiday[],
  expectedHoursPerDay: number
): number {
  const holidayDates = new Set(holidays.map((h) => h.date));
  const nonHolidayEntries = entries.filter((e) => !holidayDates.has(e.date));
  const worked = calculateTotal(nonHolidayEntries);
  const holidayHours = holidays.length * expectedHoursPerDay;
  return Math.round((worked + holidayHours) * 100) / 100;
}
