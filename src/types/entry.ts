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

export interface Holiday {
  id?: number;
  date: string;
  label: string | null;
}

export type VacationType = "paid" | "overtime";

export interface Vacation {
  id?: number;
  date: string;
  // "paid" draws on the annual allocation; "overtime" draws on accumulated
  // overtime hours ("heures supplémentaires") instead.
  type: VacationType;
}

export interface SickDay {
  id?: number;
  date: string;
}

export interface DayCalculation {
  gross: number;
  breakDuration: number;
  net: number;
  netDecimal: number;
  isComplete: boolean;
}
