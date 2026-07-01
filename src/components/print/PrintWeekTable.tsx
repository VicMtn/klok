import {
  calculateDay,
  calculateTotal,
  calculateBalance,
  calculateTotalWithHolidays,
} from "../../lib/calculations";
import { formatDecimalHours, formatBalance, minutesToTime } from "../../lib/formatting";
import { getDayName, formatDisplayDate } from "../../lib/dateUtils";
import { useT } from "../../i18n";
import type { TimeEntry, Holiday, Vacation, SickDay } from "../../types/entry";

interface Props {
  dates: string[];
  entries: Map<string, TimeEntry>;
  holidays: Map<string, Holiday>;
  vacations: Map<string, Vacation>;
  sickDays: Map<string, SickDay>;
  expectedHoursPerDay: number;
}

export function PrintWeekTable({
  dates,
  entries,
  holidays,
  vacations,
  sickDays,
  expectedHoursPerDay,
}: Props) {
  const t = useT();

  // Scope every collection to the printed dates so the credited-hours totals
  // can't be inflated by data loaded for an adjacent range.
  const visibleEntries = dates.map((d) => entries.get(d)).filter(Boolean) as TimeEntry[];
  const holidayList = dates.map((d) => holidays.get(d)).filter(Boolean) as Holiday[];
  const vacationList = dates.map((d) => vacations.get(d)).filter(Boolean) as Vacation[];
  const sickList = dates.map((d) => sickDays.get(d)).filter(Boolean) as SickDay[];

  // Worked-only sum drives the "empty printout" guard; the displayed total and
  // balance use the same credited-hours logic as the on-screen totals row.
  const workedTotal = calculateTotal(visibleEntries);
  const total = calculateTotalWithHolidays(
    visibleEntries,
    holidayList,
    expectedHoursPerDay,
    vacationList,
    sickList
  );
  const balance = calculateBalance(
    visibleEntries,
    expectedHoursPerDay,
    holidayList,
    vacationList,
    sickList
  );
  // Show the footer whenever the period carries meaning: real worked hours, or
  // any special day (an all-overtime week credits 0h yet still owes a balance).
  const hasContent =
    workedTotal > 0 ||
    holidayList.length + vacationList.length + sickList.length > 0;

  // Precedence mirrors DayRow: holiday > vacation > sick.
  const specialFor = (date: string) => {
    const holiday = holidays.get(date);
    if (holiday) {
      return {
        label: holiday.label ? `${t.entry.holiday} — ${holiday.label}` : t.entry.holiday,
        hours: expectedHoursPerDay,
        sign: "",
      };
    }
    const vacation = vacations.get(date);
    if (vacation) {
      // Overtime recovery reads as a minus: it spends accumulated overtime
      // rather than crediting the period, exactly like the on-screen row.
      return vacation.type === "overtime"
        ? { label: t.entry.overtime, hours: expectedHoursPerDay, sign: "-" }
        : { label: t.entry.vacation, hours: expectedHoursPerDay, sign: "" };
    }
    if (sickDays.get(date)) {
      return { label: t.entry.sick, hours: expectedHoursPerDay, sign: "" };
    }
    return null;
  };

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-black">
          <th className="text-left py-1 pr-2">{t.table.day}</th>
          <th className="text-center py-1 px-1">{t.table.arrival}</th>
          <th className="text-center py-1 px-1">{t.table.breakStart}</th>
          <th className="text-center py-1 px-1">{t.table.breakDuration}</th>
          <th className="text-center py-1 px-1">{t.table.breakEnd}</th>
          <th className="text-center py-1 px-1">{t.table.departure}</th>
          <th className="text-right py-1 px-1">{t.table.netTime}</th>
          <th className="text-left py-1 pl-2">{t.table.note}</th>
        </tr>
      </thead>
      <tbody>
        {dates.map((date) => {
          const dow = new Date(date + "T00:00:00").getDay();
          const isWeekend = dow === 0 || dow === 6;
          const special = specialFor(date);

          if (special) {
            return (
              <tr key={date} className="border-b border-gray-200">
                <td className="py-0.5 pr-2 capitalize">
                  {getDayName(date, true)} {formatDisplayDate(date)}
                </td>
                <td className="text-center py-0.5 px-1">—</td>
                <td className="text-center py-0.5 px-1">—</td>
                <td className="text-center py-0.5 px-1">—</td>
                <td className="text-center py-0.5 px-1">—</td>
                <td className="text-center py-0.5 px-1">—</td>
                <td className="text-right py-0.5 px-1">
                  {special.sign}
                  {formatDecimalHours(special.hours)}
                </td>
                <td className="py-0.5 pl-2">{special.label}</td>
              </tr>
            );
          }

          const e = entries.get(date);
          const { netDecimal, breakDuration, isComplete } = e
            ? calculateDay(e)
            : { netDecimal: 0, breakDuration: 0, isComplete: false };

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
              <td className="text-center py-0.5 px-1">
                {breakDuration > 0 ? minutesToTime(breakDuration) : "—"}
              </td>
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
          <td colSpan={6} className="py-1 pr-2">
            {t.table.total}
          </td>
          <td className="text-right py-1 px-1">
            {hasContent ? formatDecimalHours(total) : "—"}
          </td>
          <td className="py-1 pl-2 text-xs">{hasContent && formatBalance(balance)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
