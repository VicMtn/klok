import type { TimeEntry, DayCalculation, SpecialDay } from "../types/entry";
import { timeToMinutes } from "./formatting";

export function calculateDay(entry: TimeEntry): DayCalculation {
  const arrival = entry.arrival ? timeToMinutes(entry.arrival) : null;
  const departure = entry.departure ? timeToMinutes(entry.departure) : null;
  const breakStart = entry.break_start ? timeToMinutes(entry.break_start) : null;
  const breakEnd = entry.break_end ? timeToMinutes(entry.break_end) : null;

  const breakDuration =
    breakStart !== null && breakEnd !== null && breakEnd > breakStart
      ? breakEnd - breakStart
      : 0;

  if (arrival === null || departure === null) {
    return { gross: 0, breakDuration, net: 0, netDecimal: 0, isComplete: false };
  }

  const gross = departure - arrival;
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
  specialDays: SpecialDay[] = []
): number {
  const skipDates = new Set(specialDays.map((s) => s.date));
  const workEntries = entries.filter((e) => !skipDates.has(e.date));
  const workedDays = workEntries.filter((e) => calculateDay(e).isComplete).length;
  // Overtime-recovery days are paid out of the accumulated balance: each one
  // counts as an expected day with no hours worked, so it spends a day's worth
  // of overtime. Holiday / paid / sick days are neutral to the balance.
  const overtimeDays = specialDays.filter((s) => s.type === "overtime").length;
  const expected = (workedDays + overtimeDays) * expectedHoursPerDay;
  const actual = calculateTotal(workEntries);
  return Math.round((actual - expected) * 100) / 100;
}

export function calculateTotalWithCredits(
  entries: TimeEntry[],
  expectedHoursPerDay: number,
  specialDays: SpecialDay[] = []
): number {
  const skipDates = new Set(specialDays.map((s) => s.date));
  const workEntries = entries.filter((e) => !skipDates.has(e.date));
  const worked = calculateTotal(workEntries);
  // Holiday, paid and sick days credit a day's worth of hours. Overtime-recovery
  // days don't: those hours were already worked (and counted) earlier.
  const creditedDays = specialDays.filter((s) => s.type !== "overtime").length;
  const extraHours = creditedDays * expectedHoursPerDay;
  return Math.round((worked + extraHours) * 100) / 100;
}
