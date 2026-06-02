import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { usePrintStore } from "../../store/usePrintStore";
import { PrintWeekTable } from "./PrintWeekTable";
import { useT } from "../../i18n";

export function PrintView() {
  const t = useT();
  const entries = useEntriesStore((s) => s.entries);
  const expectedHoursPerDay = useSettingsStore(
    (s) => s.settings.expected_hours_per_week / 5
  );
  const { dates, title } = usePrintStore();

  // Always rendered so #print-view is always in the DOM.
  // CSS (@media screen/print in index.css) controls visibility.
  return (
    <div id="print-view" className="p-8 font-sans text-black text-sm">
      {dates.length > 0 && (
        <>
          <h1 className="text-base font-bold mb-1">{title}</h1>
          <p className="text-xs text-gray-500 mb-4">
            {t.print.printedOn(new Date().toLocaleDateString(t.dateLocale))}
          </p>
          <PrintWeekTable
            dates={dates}
            entries={entries}
            expectedHoursPerDay={expectedHoursPerDay}
          />
        </>
      )}
    </div>
  );
}
