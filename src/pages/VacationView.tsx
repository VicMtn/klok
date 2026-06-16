import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/layout/Header";
import { useVacationsStore } from "../store/useVacationsStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { getDayName, formatDisplayDate } from "../lib/dateUtils";
import { useT } from "../i18n";

export function VacationView() {
  const t = useT();
  const vacationsMap = useVacationsStore((s) => s.vacations);
  const loadYear = useVacationsStore((s) => s.loadYear);
  const toggle = useVacationsStore((s) => s.toggle);
  const allocation = useSettingsStore((s) => s.settings.vacation_days_per_year);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    loadYear(year);
  }, [year]);

  const vacationsForYear = useMemo(() => {
    const prefix = `${year}-`;
    return Array.from(vacationsMap.values())
      .filter((v) => v.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [vacationsMap, year]);

  const taken = vacationsForYear.length;
  const remaining = Math.max(0, allocation - taken);
  const progressPct = allocation > 0 ? Math.min(100, (taken / allocation) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <Header title={`${t.vacation.title} · ${t.vacation.yearLabel(year)}`} hideBadge />
      <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900 shrink-0">
        <button
          onClick={() => setYear(year - 1)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm"
        >
          ←
        </button>
        <button
          onClick={() => setYear(now.getFullYear())}
          className="px-2 py-1 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
        >
          {now.getFullYear()}
        </button>
        <button
          onClick={() => setYear(year + 1)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm"
        >
          →
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label={t.vacation.allocation} value={t.vacation.daysUnit(allocation)} />
          <StatCard
            label={t.vacation.taken}
            value={t.vacation.daysUnit(taken)}
            valueColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label={t.vacation.remaining}
            value={t.vacation.daysUnit(remaining)}
            valueColor={remaining > 0 ? "text-gray-800 dark:text-gray-100" : "text-red-500 dark:text-red-400"}
          />
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t.vacation.title}
            </p>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {t.vacation.progress(taken, allocation)}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full transition-all ${taken > allocation ? "bg-red-500" : "bg-emerald-500"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700/50">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t.vacation.daysListTitle}
            </p>
          </div>
          {vacationsForYear.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              {t.vacation.noVacations}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {vacationsForYear.map((v) => (
                <li key={v.date} className="flex items-center justify-between px-5 py-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-200">
                      {getDayName(v.date)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDisplayDate(v.date)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggle(v.date)}
                    title={t.vacation.removeDay}
                    className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = "text-gray-800 dark:text-gray-100",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3.5">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold font-mono ${valueColor}`}>{value}</p>
    </div>
  );
}
