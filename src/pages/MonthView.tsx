import { useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { MonthTable } from "../components/table/MonthTable";
import { Header } from "../components/layout/Header";
import { useEntriesStore } from "../store/useEntriesStore";
import { useBadgeStore } from "../store/useBadgeStore";
import { usePrintStore } from "../store/usePrintStore";
import { useHolidaysStore } from "../store/useHolidaysStore";
import { useVacationsStore } from "../store/useVacationsStore";
import { useSickDaysStore } from "../store/useSickDaysStore";
import { getMonthDates, today } from "../lib/dateUtils";
import { useT } from "../i18n";

interface Props {
  year: number;
  month: number;
  onNavigate: (year: number, month: number) => void;
}

export function MonthView({ year, month, onNavigate }: Props) {
  const t = useT();
  const loadMonth = useEntriesStore((s) => s.loadMonth);
  const hydrate = useBadgeStore((s) => s.hydrate);
  const setPrint = usePrintStore((s) => s.setPrint);
  const loadHolidaysRange = useHolidaysStore((s) => s.loadRange);
  const loadVacationsRange = useVacationsStore((s) => s.loadRange);
  const loadSickDaysRange = useSickDaysStore((s) => s.loadRange);

  const dates = useMemo(() => getMonthDates(year, month), [year, month]);
  const title = `${t.month.names[month - 1]} ${year}`;

  const prevM = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextM = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  // True only when the currently displayed month contains today
  const todayDate = today();
  const todayInView = useMemo(() => dates.includes(todayDate), [dates, todayDate]);

  // Subscribe to today's entry only — undefined when today is not in this month
  const todayEntry = useEntriesStore((s) =>
    todayInView ? s.entries.get(todayDate) : undefined
  );

  // Load entries when navigation changes
  useEffect(() => {
    loadMonth(year, month).then(() => {
      if (todayInView) hydrate(useEntriesStore.getState().entries.get(todayDate));
    });
    loadHolidaysRange(dates[0], dates[dates.length - 1]);
    loadVacationsRange(dates[0], dates[dates.length - 1]);
    loadSickDaysRange(dates[0], dates[dates.length - 1]);
    setPrint(dates, title);
  }, [year, month]);

  // Re-hydrate badge only when today's entry changes
  useEffect(() => {
    if (todayInView) hydrate(todayEntry);
  }, [todayEntry]);

  const goToday = () => {
    const now = new Date();
    onNavigate(now.getFullYear(), now.getMonth() + 1);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title={title} onPrint={() => invoke("print")} />
      <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900 shrink-0">
        <button
          onClick={() => onNavigate(prevM.year, prevM.month)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm"
        >
          ←
        </button>
        <button
          onClick={goToday}
          className="px-2 py-1 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
        >
          {t.month.today}
        </button>
        <button
          onClick={() => onNavigate(nextM.year, nextM.month)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm"
        >
          →
        </button>
      </div>
      <div className="flex-1 overflow-auto p-5">
        <MonthTable dates={dates} />
      </div>
    </div>
  );
}
