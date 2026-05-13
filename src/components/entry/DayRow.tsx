import { TimeInput } from "./TimeInput";
import { CommentInput } from "./CommentInput";
import { DayTotal } from "./DayTotal";
import { validateEntrySequence } from "../../lib/validation";
import { getDayName, formatDisplayDate, today } from "../../lib/dateUtils";
import { calculateDay } from "../../lib/calculations";
import { formatDecimalHours } from "../../lib/formatting";
import type { TimeEntry } from "../../types/entry";
import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";

export function DayRow({ date }: { date: string }) {
  const entry = useEntriesStore((s) => s.entries.get(date));
  const updateField = useEntriesStore((s) => s.updateField);
  const expectedHours = useSettingsStore((s) => s.settings.expected_hours_per_day);

  const e: TimeEntry = entry ?? {
    date,
    arrival: null,
    break_start: null,
    break_end: null,
    departure: null,
    comment: null,
  };

  const warnings = new Set(validateEntrySequence(e).map((w) => w.field));
  const { netDecimal, breakDuration, isComplete } = calculateDay(e);
  const isToday = date === today();
  const dow = new Date(date + "T00:00:00").getDay();
  const isWeekend = dow === 0 || dow === 6;

  const handle =
    (field: keyof TimeEntry) => (value: string | null) =>
      updateField(date, field, value);

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-700/50 transition-colors ${
        isToday
          ? "bg-blue-50 dark:bg-blue-900/20"
          : isWeekend
          ? "bg-gray-50/60 dark:bg-gray-800/30"
          : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
      }`}
    >
      <td className="px-3 py-2 whitespace-nowrap">
        <span
          className={`text-sm font-medium capitalize ${
            isToday
              ? "text-blue-700 dark:text-blue-300"
              : isWeekend
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          {getDayName(date, true)}
        </span>
        <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">{formatDisplayDate(date)}</span>
      </td>
      <td className="px-2 py-2 text-center">
        <TimeInput value={e.arrival} onChange={handle("arrival")} warning={warnings.has("arrival")} />
      </td>
      <td className="px-2 py-2 text-center">
        <TimeInput value={e.break_start} onChange={handle("break_start")} warning={warnings.has("break_start")} />
      </td>
      <td className="px-3 py-2 text-center">
        {breakDuration > 0
          ? <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{formatDecimalHours(breakDuration / 60)}</span>
          : <span className="text-gray-300 dark:text-gray-600 text-sm font-mono">—</span>
        }
      </td>
      <td className="px-2 py-2 text-center">
        <TimeInput value={e.break_end} onChange={handle("break_end")} warning={warnings.has("break_end")} />
      </td>
      <td className="px-2 py-2 text-center">
        <TimeInput value={e.departure} onChange={handle("departure")} warning={warnings.has("departure")} />
      </td>
      <td className="px-3 py-2 text-right">
        <DayTotal entry={e} expectedHours={expectedHours} />
      </td>
      <td className="px-3 py-2 text-right">
        {isComplete
          ? <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{netDecimal.toFixed(2)}</span>
          : <span className="text-gray-300 dark:text-gray-600 text-sm font-mono">—</span>
        }
      </td>
      <td className="px-3 py-2 min-w-32">
        <CommentInput value={e.comment} onChange={handle("comment")} />
      </td>
    </tr>
  );
}
