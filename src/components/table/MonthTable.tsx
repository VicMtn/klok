import { useMemo } from "react";
import { DayRow } from "../entry/DayRow";
import { TotalsRow } from "./TotalsRow";
import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useActivityStore } from "../../store/useActivityStore";
import { useSpecialDaysStore } from "../../store/useSpecialDaysStore";
import { totalWithCredits, cumulativeBalance } from "../../lib/calculations";
import { isoWeekMonday } from "../../lib/dateUtils";
import { useT } from "../../i18n";

export function MonthTable({ dates }: { dates: string[] }) {
  const t = useT();
  const entriesMap = useEntriesStore((s) => s.entries);
  const specialDaysMap = useSpecialDaysStore((s) => s.specialDays);
  const reference = useSettingsStore((s) => s.settings.reference_hours_per_week);
  const periods = useActivityStore((s) => s.periods);

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

  // Balance/total are computed over whole ISO weeks that *belong* to this month —
  // those whose Monday falls within the month — so a week straddling a month edge
  // is charged its full weekly target in exactly one month, never half-charged in
  // two. MonthView loads the padded range that covers these weeks.
  const first = dates[0];
  const last = dates[dates.length - 1];
  const ownsWeek = (date: string) => {
    const monday = isoWeekMonday(date);
    return monday >= first && monday <= last;
  };

  const ownedEntries = useMemo(
    () => Array.from(entriesMap.values()).filter((e) => ownsWeek(e.date)),
    [entriesMap, first, last]
  );
  const ownedSpecials = useMemo(
    () => Array.from(specialDaysMap.values()).filter((s) => ownsWeek(s.date)),
    [specialDaysMap, first, last]
  );

  const total = totalWithCredits(ownedEntries, ownedSpecials, reference, periods);
  const balance = cumulativeBalance(ownedEntries, ownedSpecials, reference, periods);

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
          <TotalsRow total={total} balance={balance} colSpan={6} />
        </tfoot>
      </table>
    </div>
  );
}
