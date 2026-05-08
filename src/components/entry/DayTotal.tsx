import { calculateDay } from "../../lib/calculations";
import { formatDecimalHours } from "../../lib/formatting";
import type { TimeEntry } from "../../types/entry";

interface Props {
  entry: TimeEntry;
  expectedHours: number;
}

export function DayTotal({ entry, expectedHours }: Props) {
  const { netDecimal, isComplete } = calculateDay(entry);
  if (!isComplete) return <span className="text-gray-300 text-sm font-mono">—</span>;

  const diff = netDecimal - expectedHours;
  const color = diff >= 0 ? "text-green-600" : "text-red-500";

  return (
    <span className={`text-sm font-medium font-mono ${color}`}>
      {formatDecimalHours(netDecimal)}
    </span>
  );
}
