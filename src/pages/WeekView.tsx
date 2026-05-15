import { useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { WeekTable } from "../components/table/WeekTable";
import { Header } from "../components/layout/Header";
import { useEntriesStore } from "../store/useEntriesStore";
import { useBadgeStore } from "../store/useBadgeStore";
import { usePrintStore } from "../store/usePrintStore";
import { useHolidaysStore } from "../store/useHolidaysStore";
import {
  getISOWeekDates,
  getISOWeek,
  today,
  prevWeek,
  nextWeek,
} from "../lib/dateUtils";

interface Props {
  year: number;
  week: number;
  onNavigate: (year: number, week: number) => void;
}

export function WeekView({ year, week, onNavigate }: Props) {
  const loadWeek = useEntriesStore((s) => s.loadWeek);
  const hydrate = useBadgeStore((s) => s.hydrate);
  const setPrint = usePrintStore((s) => s.setPrint);
  const loadHolidaysRange = useHolidaysStore((s) => s.loadRange);

  const dates = useMemo(() => getISOWeekDates(year, week), [year, week]);
  const monthLabel = useMemo(() => {
    const d = new Date(dates[0] + "T00:00:00");
    const m = d.toLocaleDateString("fr-FR", { month: "long" });
    return m.charAt(0).toUpperCase() + m.slice(1) + " " + d.getFullYear();
  }, [dates]);
  const title = `${monthLabel} — Semaine ${week}`;
  const prev = prevWeek(year, week);
  const next = nextWeek(year, week);

  // True only when the currently displayed week contains today
  const todayDate = today();
  const todayInView = useMemo(() => dates.includes(todayDate), [dates, todayDate]);

  // Subscribe to today's entry only — null when today is not in the current view
  const todayEntry = useEntriesStore((s) =>
    todayInView ? s.entries.get(todayDate) : undefined
  );

  // Load entries when navigation changes
  useEffect(() => {
    const start = dates[0];
    const end = dates[dates.length - 1];
    loadWeek(start, end).then(() => {
      if (todayInView) hydrate(useEntriesStore.getState().entries.get(todayDate));
    });
    loadHolidaysRange(start, end);
    setPrint(dates, title);
  }, [year, week]);

  // Re-hydrate badge only when today's entry changes (e.g. manual field edit)
  // This never fires for other-day edits or when viewing a past week.
  useEffect(() => {
    if (todayInView) hydrate(todayEntry);
  }, [todayEntry]);

  const goToday = () => {
    const { year: y, week: w } = getISOWeek(new Date());
    onNavigate(y, w);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={
          <>
            {monthLabel}
            <span className="text-s font-medium text-gray-400 px-2 py-0.5 rounded-full">
              Semaine : {week}
            </span>
          </>
        }
        onPrint={() => invoke("print")}
      />
      <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900 shrink-0">
        <button
          onClick={() => onNavigate(prev.year, prev.week)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm"
        >
          ←
        </button>
        <button
          onClick={goToday}
          className="px-2 py-1 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => onNavigate(next.year, next.week)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm"
        >
          →
        </button>
      </div>
      <div className="flex-1 overflow-auto p-5">
        <WeekTable dates={dates} />
      </div>
    </div>
  );
}
