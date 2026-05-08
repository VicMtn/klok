import { calculateDay } from "../../lib/calculations";
import { formatDecimalHours, formatBalance } from "../../lib/formatting";
import { getDayName, formatDisplayDate } from "../../lib/dateUtils";
import { calculateTotal, calculateBalance } from "../../lib/calculations";
import type { TimeEntry } from "../../types/entry";

interface Props {
  dates: string[];
  entries: Map<string, TimeEntry>;
  expectedHoursPerDay: number;
}

export function PrintWeekTable({ dates, entries, expectedHoursPerDay }: Props) {
  const visibleEntries = dates.map((d) => entries.get(d)).filter(Boolean) as TimeEntry[];
  const total = calculateTotal(visibleEntries);
  const balance = calculateBalance(visibleEntries, expectedHoursPerDay);

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-black">
          <th className="text-left py-1 pr-2">Jour</th>
          <th className="text-center py-1 px-1">Arrivée</th>
          <th className="text-center py-1 px-1">Pause</th>
          <th className="text-center py-1 px-1">Retour</th>
          <th className="text-center py-1 px-1">Départ</th>
          <th className="text-right py-1 px-1">Temps</th>
          <th className="text-left py-1 pl-2">Note</th>
        </tr>
      </thead>
      <tbody>
        {dates.map((date) => {
          const e = entries.get(date);
          const { netDecimal, isComplete } = e
            ? calculateDay(e)
            : { netDecimal: 0, isComplete: false };
          const dow = new Date(date + "T00:00:00").getDay();
          const isWeekend = dow === 0 || dow === 6;

          return (
            <tr
              key={date}
              className={`border-b border-gray-200 ${isWeekend ? "text-gray-400" : ""}`}
            >
              <td className="py-0.5 pr-2 capitalize">
                {getDayName(date, true)} {formatDisplayDate(date)}
              </td>
              <td className="text-center py-0.5 px-1">{e?.arrival ?? "—"}</td>
              <td className="text-center py-0.5 px-1">{e?.break_start ?? "—"}</td>
              <td className="text-center py-0.5 px-1">{e?.break_end ?? "—"}</td>
              <td className="text-center py-0.5 px-1">{e?.departure ?? "—"}</td>
              <td className="text-right py-0.5 px-1">
                {isComplete ? formatDecimalHours(netDecimal) : "—"}
              </td>
              <td className="py-0.5 pl-2">{e?.comment ?? ""}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-black font-semibold">
          <td colSpan={5} className="py-1 pr-2">
            Total
          </td>
          <td className="text-right py-1 px-1">
            {total > 0 ? formatDecimalHours(total) : "—"}
          </td>
          <td className="py-1 pl-2 text-xs">
            {total > 0 && formatBalance(balance)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
