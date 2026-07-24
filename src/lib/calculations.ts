import type { TimeEntry, DayCalculation, SpecialDay, ActivityPeriod } from "../types/entry";
import { timeToMinutes } from "./formatting";
import { getISOWeek } from "./dateUtils";

const round2 = (n: number) => Math.round(n * 100) / 100;

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
  const netDecimal = round2(net / 60);

  return { gross, breakDuration, net, netDecimal, isComplete: true };
}

export function calculateTotal(entries: TimeEntry[]): number {
  return entries.reduce((sum, e) => sum + calculateDay(e).netDecimal, 0);
}

// --- Activity-period resolution -------------------------------------------------
// The 100% reference is a single global figure (reference hours per week). Each
// dated period scales it: weekly target = reference × activity_rate, daily target
// = weekly / worked_days_per_week. Two people at the same rate can pick different
// worked_days_per_week, so the daily target is never derived from the rate alone.

// Applicable period for a date: the latest one whose effective_from <= date. Dates
// before the earliest period fall back to that earliest period. Assumes `periods`
// is sorted ascending by effective_from (as returned by getActivityPeriods).
export function periodForDate(
  periods: ActivityPeriod[],
  date: string
): ActivityPeriod | null {
  if (periods.length === 0) return null;
  let match = periods[0];
  for (const p of periods) {
    if (p.effective_from <= date) match = p;
    else break;
  }
  return match;
}

export function dailyTarget(reference: number, period: ActivityPeriod | null): number {
  if (!period || period.worked_days_per_week <= 0) return 0;
  return round2((reference * period.activity_rate) / period.worked_days_per_week);
}

export function weeklyTarget(reference: number, period: ActivityPeriod | null): number {
  if (!period) return 0;
  return round2(reference * period.activity_rate);
}

// Worked hours (excluding special-day dates) plus the credited hours of every
// holiday / paid / sick day — each credited at its own date's daily target.
// Overtime-recovery days credit nothing: those hours were pointed (and counted)
// earlier and are being spent here.
export function totalWithCredits(
  entries: TimeEntry[],
  specialDays: SpecialDay[],
  reference: number,
  periods: ActivityPeriod[]
): number {
  const skipDates = new Set(specialDays.map((s) => s.date));
  const worked = calculateTotal(entries.filter((e) => !skipDates.has(e.date)));
  const credited = specialDays
    .filter((s) => s.type !== "overtime")
    .reduce((sum, s) => sum + dailyTarget(reference, periodForDate(periods, s.date)), 0);
  return round2(worked + credited);
}

// ISO year+week key, e.g. "2026-W29", used to bucket days into weeks.
function weekKey(date: string): string {
  const { year, week } = getISOWeek(new Date(date + "T00:00:00"));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// An ISO week is "active" once it holds at least one complete worked day or one
// special day. Each active week owes exactly one weekly target (resolved from the
// earliest dated day of that week). Fully empty weeks are never charged, so gaps —
// before the app was used, or weeks entirely off-grid — don't distort the balance.
function sumActiveWeekTargets(
  entries: TimeEntry[],
  specialDays: SpecialDay[],
  reference: number,
  periods: ActivityPeriod[]
): number {
  const weekRep = new Map<string, string>(); // week key -> earliest date seen
  const note = (date: string) => {
    const key = weekKey(date);
    const cur = weekRep.get(key);
    if (cur === undefined || date < cur) weekRep.set(key, date);
  };

  const skipDates = new Set(specialDays.map((s) => s.date));
  for (const e of entries) {
    if (skipDates.has(e.date)) continue;
    if (calculateDay(e).isComplete) note(e.date);
  }
  for (const s of specialDays) note(s.date);

  let sum = 0;
  for (const date of weekRep.values()) {
    sum += weeklyTarget(reference, periodForDate(periods, date));
  }
  return round2(sum);
}

// Per-day balance: compares worked hours against the daily target for each
// completed day only. Avoids the mid-week negative caused by charging a full
// weekly target when only part of the week is done.
export function partialBalance(
  entries: TimeEntry[],
  specialDays: SpecialDay[],
  reference: number,
  periods: ActivityPeriod[]
): number {
  const skipDates = new Set(specialDays.map((s) => s.date));
  const workedTarget = entries
    .filter((e) => !skipDates.has(e.date) && calculateDay(e).isComplete)
    .reduce((sum, e) => sum + dailyTarget(reference, periodForDate(periods, e.date)), 0);
  const specialTarget = specialDays
    .filter((s) => s.type !== "overtime")
    .reduce((sum, s) => sum + dailyTarget(reference, periodForDate(periods, s.date)), 0);
  const total = totalWithCredits(entries, specialDays, reference, periods);
  return round2(total - workedTarget - specialTarget);
}

// Cumulative balance = credited hours − the sum of every active week's target.
// Applied to a single ISO week (week view) this charges exactly one weekly target;
// applied to a month or a year it accumulates the per-week deviations. A week where
// more days than scheduled are pointed shows overtime; a week short of its target
// (with no special day covering the gap) shows a deficit — the strict weekly model.
export function cumulativeBalance(
  entries: TimeEntry[],
  specialDays: SpecialDay[],
  reference: number,
  periods: ActivityPeriod[]
): number {
  const total = totalWithCredits(entries, specialDays, reference, periods);
  const target = sumActiveWeekTargets(entries, specialDays, reference, periods);
  return round2(total - target);
}
