import { useEffect, useMemo, useState } from "react";
import { BarChart, ChartsReferenceLine } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Header } from "../components/layout/Header";
import { getEntriesForYear, getHolidaysForYear } from "../lib/db";
import { calculateDay, calculateTotalWithHolidays, calculateBalance } from "../lib/calculations";
import { getISOWeek } from "../lib/dateUtils";
import { formatDecimalHours, formatBalance } from "../lib/formatting";
import { useSettingsStore } from "../store/useSettingsStore";
import { useThemeStore } from "../store/useThemeStore";
import type { TimeEntry, Holiday } from "../types/entry";

const lightTheme = createTheme({ palette: { mode: "light" } });
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { paper: "#1f2937", default: "#111827" },
    text: { primary: "#f3f4f6", secondary: "#9ca3af" },
  },
});

function buildWeeklyData(
  entries: TimeEntry[],
  holidays: Holiday[],
  upToWeek: number,
  expectedHoursPerWeek: number
) {
  const expectedHoursPerDay = expectedHoursPerWeek / 5;
  const weekMap = new Map<number, number>();
  const holidayDates = new Set(holidays.map((h) => h.date));

  for (const entry of entries) {
    if (holidayDates.has(entry.date)) continue;
    const { netDecimal, isComplete } = calculateDay(entry);
    if (!isComplete) continue;
    const { week } = getISOWeek(new Date(entry.date + "T00:00:00"));
    if (week >= 1 && week <= upToWeek) {
      weekMap.set(week, Math.round(((weekMap.get(week) ?? 0) + netDecimal) * 100) / 100);
    }
  }

  for (const holiday of holidays) {
    const { week } = getISOWeek(new Date(holiday.date + "T00:00:00"));
    if (week >= 1 && week <= upToWeek) {
      weekMap.set(week, Math.round(((weekMap.get(week) ?? 0) + expectedHoursPerDay) * 100) / 100);
    }
  }

  return Array.from({ length: upToWeek }, (_, i) => {
    const w = i + 1;
    return { label: `S${w}`, hours: weekMap.get(w) ?? 0 };
  });
}

export function StatsView() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const expectedHoursPerWeek = useSettingsStore((s) => s.settings.expected_hours_per_week);
  const expectedHoursPerDay = expectedHoursPerWeek / 5;
  const dark = useThemeStore((s) => s.dark);

  const now = new Date();
  const year = now.getFullYear();
  const { week: currentWeek } = getISOWeek(now);

  useEffect(() => {
    getEntriesForYear(year).then(setEntries);
    getHolidaysForYear(year).then(setHolidays);
  }, [year]);

  const weeklyData = useMemo(
    () => buildWeeklyData(entries, holidays, currentWeek, expectedHoursPerWeek),
    [entries, holidays, currentWeek, expectedHoursPerWeek]
  );

  const totalHours = useMemo(
    () => calculateTotalWithHolidays(entries, holidays, expectedHoursPerDay),
    [entries, holidays, expectedHoursPerDay]
  );

  const balance = useMemo(
    () => calculateBalance(entries, expectedHoursPerDay, holidays),
    [entries, holidays, expectedHoursPerDay]
  );

  const workedDays = useMemo(() => {
    const holidayDates = new Set(holidays.map((h) => h.date));
    const regularDays = entries.filter(
      (e) => !holidayDates.has(e.date) && calculateDay(e).isComplete
    ).length;
    return regularDays + holidays.length;
  }, [entries, holidays]);

  const completedWeeks = weeklyData.slice(0, currentWeek - 1);
  const workedWeeks = completedWeeks.filter((w) => w.hours > 0).length;
  const completedHours = completedWeeks.reduce((s, w) => s + w.hours, 0);
  const avgPerWeek = workedWeeks > 0 ? Math.round((completedHours / workedWeeks) * 100) / 100 : 0;

  const expectedWeeklyHours = expectedHoursPerWeek;
  const labels = weeklyData.map((d) => d.label);
  const values = weeklyData.map((d) => d.hours);

  const refLineColor = dark ? "#f87171" : "#ef4444";

  return (
    <div className="flex flex-col h-full">
      <Header title={`Statistiques ${year}`} hideBadge />
      <div className="flex-1 overflow-auto p-5 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Heures travaillées" value={totalHours > 0 ? formatDecimalHours(totalHours) : "—"} />
          <StatCard label="Jours travaillés" value={workedDays > 0 ? `${workedDays} j` : "—"} />
          <StatCard
            label="Balance"
            value={totalHours > 0 ? formatBalance(balance) : "—"}
            valueColor={balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}
          />
          <StatCard label="Moy. par semaine" value={avgPerWeek > 0 ? formatDecimalHours(avgPerWeek) : "—"} />
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Heures nettes par semaine
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Semaines 1 à {currentWeek} · objectif {expectedWeeklyHours}h / semaine
            </p>
          </div>
          <ThemeProvider theme={dark ? darkTheme : lightTheme}>
            <BarChart
              xAxis={[{
                scaleType: "band",
                data: labels,
                tickLabelStyle: { fontSize: 10 },
                disableTicks: true,
              }]}
              yAxis={[{
                valueFormatter: (v: number) => `${v}h`,
                tickLabelStyle: { fontSize: 10 },
                tickMinStep: 5,
              }]}
              series={[{
                data: values,
                color: dark ? "#60a5fa" : "#3b82f6",
                valueFormatter: (v) => (v !== null && v > 0 ? `${v}h` : "—"),
              }]}
              height={320}
              margin={{ left: 44, right: 16, top: 16, bottom: 36 }}
              slots={{ legend: () => null }}
              borderRadius={3}
            >
              <ChartsReferenceLine
                y={expectedWeeklyHours}
                label={`${expectedWeeklyHours}h`}
                lineStyle={{ stroke: refLineColor, strokeDasharray: "5 3", strokeWidth: 1.5 }}
                labelStyle={{ fontSize: 10, fill: refLineColor, fontWeight: 600 }}
                labelAlign="end"
              />
            </BarChart>
          </ThemeProvider>
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
