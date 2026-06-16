import { useEffect, useRef, useState } from "react";
import { TimeInput } from "./TimeInput";
import { CommentInput } from "./CommentInput";
import { DayTotal } from "./DayTotal";
import { ConfirmModal } from "../ui/ConfirmModal";
import { validateEntrySequence } from "../../lib/validation";
import { getDayName, formatDisplayDate, today } from "../../lib/dateUtils";
import { calculateDay } from "../../lib/calculations";
import { formatDecimalHours } from "../../lib/formatting";
import type { TimeEntry } from "../../types/entry";
import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useHolidaysStore } from "../../store/useHolidaysStore";
import { useVacationsStore } from "../../store/useVacationsStore";
import { useT } from "../../i18n";

export function DayRow({ date }: { date: string }) {
  const entry = useEntriesStore((s) => s.entries.get(date));
  const updateField = useEntriesStore((s) => s.updateField);
  const expectedHoursPerWeek = useSettingsStore((s) => s.settings.expected_hours_per_week);
  const expectedHours = expectedHoursPerWeek / 5;
  const holiday = useHolidaysStore((s) => s.holidays.get(date));
  const toggleHoliday = useHolidaysStore((s) => s.toggle);
  const updateLabel = useHolidaysStore((s) => s.updateLabel);
  const vacation = useVacationsStore((s) => s.vacations.get(date));
  const toggleVacation = useVacationsStore((s) => s.toggle);

  const t = useT();
  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showVacConfirm, setShowVacConfirm] = useState(false);

  const e: TimeEntry = entry ?? {
    date,
    arrival: null,
    break_start: null,
    break_end: null,
    departure: null,
    comment: null,
  };

  const isHoliday = holiday !== undefined;
  const isVacation = vacation !== undefined && !isHoliday;
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

  if (isVacation) {
    return (
      <tr className="border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/60 dark:bg-emerald-900/10">
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="text-sm font-medium capitalize text-emerald-700 dark:text-emerald-400">
            {getDayName(date, true)}
          </span>
          <span className="ml-1.5 text-xs text-emerald-500/70 dark:text-emerald-500/60">{formatDisplayDate(date)}</span>
        </td>
        <td colSpan={5} className="px-3 py-2">
          <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">
            {t.entry.vacation}
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          <span className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400">
            {formatDecimalHours(expectedHours)}
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          <span className="text-sm font-mono text-emerald-500 dark:text-emerald-500">
            {expectedHours.toFixed(2)}
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          <button
            onClick={() => setShowVacConfirm(true)}
            title={t.entry.removeVacation}
            className="text-xs text-emerald-400 dark:text-emerald-600 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1"
          >
            ×
          </button>
          {showVacConfirm && (
            <ConfirmModal
              message={t.entry.removeVacationConfirm}
              onConfirm={() => { toggleVacation(date); setShowVacConfirm(false); }}
              onCancel={() => setShowVacConfirm(false)}
            />
          )}
        </td>
      </tr>
    );
  }

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
              {t.entry.holiday}
            </span>
            <input
              type="text"
              value={currentLabel}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={handleLabelBlur}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              placeholder={t.entry.holidayPlaceholder}
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
            onClick={() => setShowConfirm(true)}
            title={t.entry.removeHoliday}
            className="text-xs text-amber-400 dark:text-amber-600 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1"
          >
            ×
          </button>
          {showConfirm && (
            <ConfirmModal
              message={t.entry.removeHolidayConfirm}
              onConfirm={() => { toggleHoliday(date); setShowConfirm(false); }}
              onCancel={() => setShowConfirm(false)}
            />
          )}
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
          <RowMenu
            onHoliday={() => toggleHoliday(date)}
            onVacation={() => toggleVacation(date)}
            holidayLabel={t.entry.markHoliday}
            vacationLabel={t.entry.markVacation}
          />
        </div>
      </td>
    </tr>
  );
}

interface RowMenuProps {
  onHoliday: () => void;
  onVacation: () => void;
  holidayLabel: string;
  vacationLabel: string;
}

function RowMenu({ onHoliday, onVacation, holidayLabel, vacationLabel }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="menu"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-20 py-1">
          <button
            onClick={() => { onHoliday(); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            {holidayLabel}
          </button>
          <button
            onClick={() => { onVacation(); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            {vacationLabel}
          </button>
        </div>
      )}
    </div>
  );
}
