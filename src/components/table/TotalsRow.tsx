import { calculateTotal, calculateBalance } from "../../lib/calculations";
import { formatDecimalHours, formatBalance } from "../../lib/formatting";
import type { TimeEntry } from "../../types/entry";

interface Props {
  entries: TimeEntry[];
  expectedHoursPerDay: number;
  colSpan?: number;
}

export function TotalsRow({ entries, expectedHoursPerDay, colSpan = 5 }: Props) {
  const total = calculateTotal(entries);
  const balance = calculateBalance(entries, expectedHoursPerDay);

  return (
    <tr className="bg-gray-50 border-t-2 border-gray-200">
      <td className="px-3 py-2 text-sm text-gray-500 font-medium" colSpan={colSpan}>
        Total
      </td>
      <td className="px-3 py-2 text-right">
        <span className="text-sm font-mono font-semibold text-gray-800">
          {total > 0 ? formatDecimalHours(total) : "—"}
        </span>
      </td>
      <td className="px-3 py-2">
        {total > 0 && (
          <span
            className={`text-xs font-mono font-medium ${
              balance >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {formatBalance(balance)}
          </span>
        )}
      </td>
    </tr>
  );
}
