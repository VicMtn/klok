import { useMemo } from "react";
import { DayRow } from "../entry/DayRow";
import { TotalsRow } from "./TotalsRow";
import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useHolidaysStore } from "../../store/useHolidaysStore";
import type { TimeEntry, Holiday } from "../../types/entry";

const HEADERS: { label: string; align: string }[] = [
  { label: "Jour",        align: "text-left"   },
  { label: "Arrivée",    align: "text-center"  },
  { label: "Pause →",    align: "text-center"  },
  { label: "Durée pause", align: "text-center" },
  { label: "← Retour",   align: "text-center"  },
  { label: "Départ",     align: "text-center"  },
  { label: "Temps net",  align: "text-right"   },
  { label: "Décimal",    align: "text-right"   },
  { label: "Note",       align: "text-left"    },
];

export function WeekTable({ dates }: { dates: string[] }) {
  const entriesMap = useEntriesStore((s) => s.entries);
  const holidaysMap = useHolidaysStore((s) => s.holidays);
  const expectedHoursPerDay = useSettingsStore(
    (s) => s.settings.expected_hours_per_day
  );

  const entries = useMemo(
    () => dates.map((d) => entriesMap.get(d)).filter((e): e is TimeEntry => e !== undefined),
    [entriesMap, dates]
  );

  const holidays = useMemo(
    () => dates.map((d) => holidaysMap.get(d)).filter((h): h is Holiday => h !== undefined),
    [holidaysMap, dates]
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
            {HEADERS.map(({ label, align }) => (
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
            holidays={holidays}
            expectedHoursPerDay={expectedHoursPerDay}
            colSpan={6}
          />
        </tfoot>
      </table>
    </div>
  );
}
