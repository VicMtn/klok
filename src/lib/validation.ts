import type { TimeEntry } from "../types/entry";
import { timeToMinutes } from "./formatting";

export interface ValidationWarning {
  field: string;
  message: string;
}

export function validateEntrySequence(entry: TimeEntry): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const { arrival, break_start, break_end, departure } = entry;

  const toMin = (t: string | null) => (t ? timeToMinutes(t) : null);
  const a = toMin(arrival);
  const bs = toMin(break_start);
  const be = toMin(break_end);
  const d = toMin(departure);

  if (a !== null && d !== null && d <= a)
    warnings.push({ field: "departure", message: "Départ avant l'arrivée" });
  if (a !== null && bs !== null && bs <= a)
    warnings.push({ field: "break_start", message: "Pause avant l'arrivée" });
  if (bs !== null && be !== null && be <= bs)
    warnings.push({ field: "break_end", message: "Fin pause avant début" });
  if (be !== null && d !== null && d <= be)
    warnings.push({ field: "departure", message: "Départ avant fin de pause" });
  if (break_end && !break_start)
    warnings.push({ field: "break_end", message: "Fin pause sans début" });

  return warnings;
}
