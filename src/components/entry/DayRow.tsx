import { useState } from "react";
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
import { useHolidaysStore } from "../../store/useHolidaysStore";

export function DayRow({ date }: { date: string }) {
  const entry = useEntriesStore((s) => s.entries.get(date));
  const updateField = useEntriesStore((s) => s.updateField);
  const expectedHours = useSettingsStore((s) => s.settings.expected_hours_per_day);
  const holiday = useHolidaysStore((s) => s.holidays.get(date));
  const toggleHoliday = useHolidaysStore((s) => s.toggle);
  const updateLabel = useHolidaysStore((s) => s.updateLabel);

  const [labelDraft, setLabelDraft] = useState<string | null>(null);

  const e: TimeEntry = entry ?? {
    date,
    arrival: null,
    break_start: null,
    break_end: null,
    departure: null,
    comment: null,
  };

  const isHoliday = holiday !== undefined;
  const warnings = new Set(validateEntrySequence(e).map((w) => w.field));
  const { netDecimal, breakDuration, isComplete } = calculateDay(e);
  const isToday = date === today();
  const dow = new Date(date + "T00:00:00").getDay();
  const isWeekend = dow === 0 || dow === 6;

  const handle =
    (field: keyof TimeEntry) => (value: string | null) =>
      updateField(date, field, value);

  const currentLabel = labelDraft !== null ? labelDraft : (holiday?.label ?? "");

  const handleLabelBlur = () => {
    if (labelDraft !== null) {
      updateLabel(date, labelDraft || null);
      setLabelDraft(null);
    }
  };

  if (isHoliday) {
    return (
      <tr className="border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/10">
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="text-sm font-medium capitalize text-amber-700 dark:text-amber-400">
            {getDayName(date, true)}
          </span>
          <span className="ml-1.5 text-xs text-amber-500/70 dark:text-amber-500/60">{formatDisplayDate(date)}</span>
        </td>
        <td colSpan={5} className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
              Férié
            </span>
            <input
              type="text"
              value={currentLabel}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={handleLabelBlur}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              placeholder="Nom du jour férié (optionnel)"
              className="text-sm text-amber-700 dark:text-amber-400 bg-transparent border-none outline-none placeholder-amber-300 dark:placeholder-amber-700 flex-1 min-w-0"
            />
          </div>
        </td>
        <td className="px-3 py-2 text-right">
          <span className="text-sm font-mono font-medium text-amber-600 dark:text-amber-400">
            {formatDecimalHours(expectedHours)}
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          <span className="text-sm font-mono text-amber-500 dark:text-amber-500">
            {expectedHours.toFixed(2)}
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          <button
            onClick={() => toggleHoliday(date)}
            title="Retirer le statut férié"
            className="text-xs text-amber-400 dark:text-amber-600 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1"
          >
            ×
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-700/50 transition-colors group ${isToday
        ? "bg-blue-50 dark:bg-blue-900/20"
        : isWeekend
          ? "bg-gray-50/60 dark:bg-gray-800/30"
          : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
        }`}
    >
      <td className="px-3 py-2 whitespace-nowrap">
        <span
          className={`text-sm font-medium capitalize ${isToday
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
        <div className="flex items-center gap-1.5">
          <CommentInput value={e.comment} onChange={handle("comment")} />
          <button
            onClick={() => toggleHoliday(date)}
            title="Marquer comme jour férié"
            className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 hover:text-amber-500 dark:hover:text-amber-400 transition-all shrink-0 px-1"
          >
            Férié
          </button>
        </div>
      </td>
    </tr>
  );
}
