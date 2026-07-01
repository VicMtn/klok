import { useEffect, useMemo, useState } from "react";
import { BarChart, ChartsReferenceLine } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Header } from "../components/layout/Header";
import { getEntriesForYear, getHolidaysForYear, getVacationsForYear, getSickDaysForYear } from "../lib/db";
import { calculateDay, calculateTotalWithHolidays, calculateBalance } from "../lib/calculations";
import { getISOWeek } from "../lib/dateUtils";
import { formatDecimalHours, formatBalance } from "../lib/formatting";
import { useSettingsStore } from "../store/useSettingsStore";
import { useThemeStore } from "../store/useThemeStore";
import { useT } from "../i18n";
import type { TimeEntry, Holiday, Vacation, SickDay } from "../types/entry";

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
  vacations: Vacation[],
  sickDays: SickDay[],
  upToWeek: number,
  expectedHoursPerWeek: number
) {
  const expectedHoursPerDay = expectedHoursPerWeek / 5;
  const weekMap = new Map<number, number>();
  const skipDates = new Set([
    ...holidays.map((h) => h.date),
    ...vacations.map((v) => v.date),
    ...sickDays.map((s) => s.date),
  ]);

  for (const entry of entries) {
    if (skipDates.has(entry.date)) continue;
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

  for (const vacation of vacations) {
    const { week } = getISOWeek(new Date(vacation.date + "T00:00:00"));
    if (week >= 1 && week <= upToWeek) {
      weekMap.set(week, Math.round(((weekMap.get(week) ?? 0) + expectedHoursPerDay) * 100) / 100);
    }
  }

  for (const sickDay of sickDays) {
    const { week } = getISOWeek(new Date(sickDay.date + "T00:00:00"));
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
  const t = useT();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [sickDays, setSickDays] = useState<SickDay[]>([]);
  const expectedHoursPerWeek = useSettingsStore((s) => s.settings.expected_hours_per_week);
  const expectedHoursPerDay = expectedHoursPerWeek / 5;
  const vacationAllocation = useSettingsStore((s) => s.settings.vacation_days_per_year);
  const dark = useThemeStore((s) => s.dark);

  const now = new Date();
  const year = now.getFullYear();
  const { week: currentWeek } = getISOWeek(now);

  useEffect(() => {
    getEntriesForYear(year).then(setEntries);
    getHolidaysForYear(year).then(setHolidays);
    getVacationsForYear(year).then(setVacations);
    getSickDaysForYear(year).then(setSickDays);
  }, [year]);

  const weeklyData = useMemo(
    () => buildWeeklyData(entries, holidays, vacations, sickDays, currentWeek, expectedHoursPerWeek),
    [entries, holidays, vacations, sickDays, currentWeek, expectedHoursPerWeek]
  );

  const totalHours = useMemo(
    () => calculateTotalWithHolidays(entries, holidays, expectedHoursPerDay, vacations, sickDays),
    [entries, holidays, vacations, sickDays, expectedHoursPerDay]
  );

  const balance = useMemo(
    () => calculateBalance(entries, expectedHoursPerDay, holidays, vacations, sickDays),
    [entries, holidays, vacations, sickDays, expectedHoursPerDay]
  );

  const workedDays = useMemo(() => {
    const skipDates = new Set([
      ...holidays.map((h) => h.date),
      ...vacations.map((v) => v.date),
      ...sickDays.map((s) => s.date),
    ]);
    const regularDays = entries.filter(
      (e) => !skipDates.has(e.date) && calculateDay(e).isComplete
    ).length;
    return regularDays + holidays.length + vacations.length + sickDays.length;
  }, [entries, holidays, vacations, sickDays]);

  // Recovery days come out of overtime, not the annual allocation.
  const vacationTaken = vacations.filter((v) => v.type !== "overtime").length;
  const vacationRemaining = Math.max(0, vacationAllocation - vacationTaken);
  const sickTaken = sickDays.length;

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
      <Header title={`${t.nav.stats} ${year}`} hideBadge />
      <div className="flex-1 overflow-auto p-5 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <StatCard label={t.stats.hoursWorked} value={totalHours > 0 ? formatDecimalHours(totalHours) : "—"} />
          <StatCard label={t.stats.daysWorked} value={workedDays > 0 ? t.stats.daysUnit(workedDays) : "—"} />
          <StatCard
            label={t.stats.balance}
            value={totalHours > 0 ? formatBalance(balance) : "—"}
            valueColor={balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}
          />
          <StatCard label={t.stats.avgPerWeek} value={avgPerWeek > 0 ? formatDecimalHours(avgPerWeek) : "—"} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label={t.stats.vacationTaken}
            value={t.stats.daysUnit(vacationTaken)}
            valueColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label={t.stats.vacationRemaining}
            value={t.stats.daysUnit(vacationRemaining)}
            valueColor={vacationRemaining > 0 ? "text-gray-800 dark:text-gray-100" : "text-red-500 dark:text-red-400"}
          />
          <StatCard
            label={t.stats.sickDays}
            value={sickTaken > 0 ? t.stats.daysUnit(sickTaken) : "—"}
            valueColor="text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t.stats.netHoursPerWeek}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {t.stats.weekRangeGoal(currentWeek, expectedWeeklyHours)}
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
