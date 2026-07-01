import { calculateTotalWithHolidays, calculateBalance } from "../../lib/calculations";
import { formatDecimalHours, formatBalance } from "../../lib/formatting";
import { useT } from "../../i18n";
import type { TimeEntry, Holiday, Vacation, SickDay } from "../../types/entry";

interface Props {
  entries: TimeEntry[];
  holidays: Holiday[];
  vacations?: Vacation[];
  sickDays?: SickDay[];
  expectedHoursPerDay: number;
  colSpan?: number;
}

export function TotalsRow({ entries, holidays, vacations = [], sickDays = [], expectedHoursPerDay, colSpan = 5 }: Props) {
  const t = useT();
  const total = calculateTotalWithHolidays(entries, holidays, expectedHoursPerDay, vacations, sickDays);
  const balance = calculateBalance(entries, expectedHoursPerDay, holidays, vacations, sickDays);

  return (
    <tr className="bg-gray-50 dark:bg-gray-800/60 border-t-2 border-gray-200 dark:border-gray-700">
      <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium" colSpan={colSpan}>
        {t.table.total}
      </td>
      <td className="px-3 py-2 text-right">
        <span className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-100">
          {total > 0 ? formatDecimalHours(total) : "—"}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        <span className="text-sm font-mono font-semibold text-gray-500 dark:text-gray-400">
          {total > 0 ? total.toFixed(2) : "—"}
        </span>
      </td>
      <td className="px-3 py-2">
        {total > 0 && (
          <span
            className={`text-xs font-mono font-medium ${
              balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
            }`}
          >
            {formatBalance(balance)}
          </span>
        )}
      </td>
    </tr>
  );
}
