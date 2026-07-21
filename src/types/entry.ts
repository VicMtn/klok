export interface TimeEntry {
  id?: number;
  date: string;
  arrival: string | null;
  break_start: string | null;
  break_end: string | null;
  departure: string | null;
  comment: string | null;
  updated_at?: string;
}

export type TimeField = "arrival" | "break_start" | "break_end" | "departure";

// A single date-keyed status. All types are excluded from worked-day counting
// and (except "overtime") credit a day's worth of expected hours:
//   holiday  — public holiday, optional label
//   paid     — paid vacation, drawn from the annual allocation
//   overtime — recovery day, drawn from accumulated overtime ("heures sup.")
//   sick     — sick day, tracked separately, no allocation cap
export type SpecialDayType = "holiday" | "paid" | "overtime" | "sick";

export interface SpecialDay {
  id?: number;
  date: string;
  type: SpecialDayType;
  label?: string | null;
}

// A dated slice of the activity schedule. Runs from `effective_from` (inclusive)
// until the day before the next period's `effective_from`. The target hours for a
// date are derived from the global reference_hours_per_week and the applicable
// period: weekly = reference × activity_rate, daily = weekly / worked_days_per_week.
export interface ActivityPeriod {
  effective_from: string;        // 'YYYY-MM-DD', inclusive
  activity_rate: number;         // fraction 0..1
  worked_days_per_week: number;  // 1..7
}

export interface DayCalculation {
  gross: number;
  breakDuration: number;
  net: number;
  netDecimal: number;
  isComplete: boolean;
}
