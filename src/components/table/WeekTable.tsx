import { useMemo } from "react";
import { DayRow } from "../entry/DayRow";
import { TotalsRow } from "./TotalsRow";
import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import type { TimeEntry } from "../../types/entry";

const HEADERS = ["Jour", "Arrivée", "Pause →", "← Retour", "Départ", "Temps net", "Note"];

export function WeekTable({ dates }: { dates: string[] }) {
  const entriesMap = useEntriesStore((s) => s.entries);
  const expectedHoursPerDay = useSettingsStore(
    (s) => s.settings.expected_hours_per_day
  );

  const entries = useMemo(
    () => dates.map((d) => entriesMap.get(d)).filter((e): e is TimeEntry => e !== undefined),
    [entriesMap, dates]
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50/80">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap"
              >
                {h}
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
            expectedHoursPerDay={expectedHoursPerDay}
            colSpan={5}
          />
        </tfoot>
      </table>
    </div>
  );
}
