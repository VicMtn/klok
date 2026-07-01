import { useMemo } from "react";
import { DayRow } from "../entry/DayRow";
import { TotalsRow } from "./TotalsRow";
import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useSpecialDaysStore } from "../../store/useSpecialDaysStore";
import { useT } from "../../i18n";
import type { TimeEntry, SpecialDay } from "../../types/entry";

export function MonthTable({ dates }: { dates: string[] }) {
  const t = useT();
  const entriesMap = useEntriesStore((s) => s.entries);
  const specialDaysMap = useSpecialDaysStore((s) => s.specialDays);
  const expectedHoursPerDay = useSettingsStore(
    (s) => s.settings.expected_hours_per_week / 5
  );

  const headers: { label: string; align: string }[] = [
    { label: t.table.day,           align: "text-left"   },
    { label: t.table.arrival,       align: "text-center" },
    { label: t.table.breakStart,    align: "text-center" },
    { label: t.table.breakDuration, align: "text-center" },
    { label: t.table.breakEnd,      align: "text-center" },
    { label: t.table.departure,     align: "text-center" },
    { label: t.table.netTime,       align: "text-right"  },
    { label: t.table.decimal,       align: "text-right"  },
    { label: t.table.note,          align: "text-left"   },
  ];

  const entries = useMemo(
    () => dates.map((d) => entriesMap.get(d)).filter((e): e is TimeEntry => e !== undefined),
    [entriesMap, dates]
  );

  const specialDays = useMemo(
    () => dates.map((d) => specialDaysMap.get(d)).filter((s): s is SpecialDay => s !== undefined),
    [specialDaysMap, dates]
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 sticky top-0">
            {headers.map(({ label, align }) => (
              <th
                key={label}
                className={`px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap ${align}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((date) => (
            <DayRow key={date} date={date} />
          ))}
        </tbody>
        <tfoot>
          <TotalsRow
            entries={entries}
            specialDays={specialDays}
            expectedHoursPerDay={expectedHoursPerDay}
            colSpan={6}
          />
        </tfoot>
      </table>
    </div>
  );
}
