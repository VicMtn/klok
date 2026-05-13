import { useEffect, useMemo, useState } from "react";
import { BarChart, ChartsReferenceLine } from "@mui/x-charts";
import { Header } from "../components/layout/Header";
import { getEntriesForYear } from "../lib/db";
import { calculateDay, calculateTotal, calculateBalance } from "../lib/calculations";
import { getISOWeek } from "../lib/dateUtils";
import { formatDecimalHours, formatBalance } from "../lib/formatting";
import { useSettingsStore } from "../store/useSettingsStore";
import type { TimeEntry } from "../types/entry";

function buildWeeklyData(entries: TimeEntry[], upToWeek: number) {
  const weekMap = new Map<number, number>();
  for (const entry of entries) {
    const { netDecimal, isComplete } = calculateDay(entry);
    if (!isComplete) continue;
    const { week } = getISOWeek(new Date(entry.date + "T00:00:00"));
    if (week >= 1 && week <= upToWeek) {
      weekMap.set(week, Math.round(((weekMap.get(week) ?? 0) + netDecimal) * 100) / 100);
    }
  }
  return Array.from({ length: upToWeek }, (_, i) => {
    const w = i + 1;
    return { label: `S${w}`, hours: weekMap.get(w) ?? 0 };
  });
}

export function StatsView() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const expectedHoursPerDay = useSettingsStore((s) => s.settings.expected_hours_per_day);

  const now = new Date();
  const year = now.getFullYear();
  const { week: currentWeek } = getISOWeek(now);

  useEffect(() => {
    getEntriesForYear(year).then(setEntries);
  }, [year]);

  const weeklyData = useMemo(() => buildWeeklyData(entries, currentWeek), [entries, currentWeek]);
  const totalHours = useMemo(() => calculateTotal(entries), [entries]);
  const balance = useMemo(() => calculateBalance(entries, expectedHoursPerDay), [entries, expectedHoursPerDay]);
  const workedDays = useMemo(() => entries.filter((e) => calculateDay(e).isComplete).length, [entries]);
  const completedWeeks = weeklyData.slice(0, currentWeek - 1);
  const workedWeeks = completedWeeks.filter((w) => w.hours > 0).length;
  const completedHours = completedWeeks.reduce((s, w) => s + w.hours, 0);
  const avgPerWeek = workedWeeks > 0 ? Math.round((completedHours / workedWeeks) * 100) / 100 : 0;

  const expectedWeeklyHours = expectedHoursPerDay * 5;
  const labels = weeklyData.map((d) => d.label);
  const values = weeklyData.map((d) => d.hours);

  return (
    <div className="flex flex-col h-full">
      <Header title={`Statistiques ${year}`} />
      <div className="flex-1 overflow-auto p-5 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Heures travaillées" value={totalHours > 0 ? formatDecimalHours(totalHours) : "—"} />
          <StatCard label="Jours travaillés" value={workedDays > 0 ? `${workedDays} j` : "—"} />
          <StatCard
            label="Balance"
            value={totalHours > 0 ? formatBalance(balance) : "—"}
            valueColor={balance >= 0 ? "text-green-600" : "text-red-500"}
          />
          <StatCard label="Moy. par semaine" value={avgPerWeek > 0 ? formatDecimalHours(avgPerWeek) : "—"} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Heures nettes par semaine
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Semaines 1 à {currentWeek} · objectif {expectedWeeklyHours}h / semaine
            </p>
          </div>
          <BarChart
            xAxis={[{
              scaleType: "band",
              data: labels,
              tickLabelStyle: { fontSize: 10, fill: "#9ca3af" },
              disableTicks: true,
            }]}
            yAxis={[{
              valueFormatter: (v: number) => `${v}h`,
              tickLabelStyle: { fontSize: 10, fill: "#9ca3af" },
              tickMinStep: 5,
            }]}
            series={[{
              data: values,
              color: "#3b82f6",
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
              lineStyle={{ stroke: "#ef4444", strokeDasharray: "5 3", strokeWidth: 1.5 }}
              labelStyle={{ fontSize: 10, fill: "#ef4444", fontWeight: 600 }}
              labelAlign="end"
            />
          </BarChart>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = "text-gray-800",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3.5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold font-mono ${valueColor}`}>{value}</p>
    </div>
  );
}
