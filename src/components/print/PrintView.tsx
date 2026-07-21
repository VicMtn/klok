import { useEntriesStore } from "../../store/useEntriesStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useActivityStore } from "../../store/useActivityStore";
import { usePrintStore } from "../../store/usePrintStore";
import { useSpecialDaysStore } from "../../store/useSpecialDaysStore";
import { PrintWeekTable } from "./PrintWeekTable";
import { useT } from "../../i18n";

export function PrintView() {
  const t = useT();
  const entries = useEntriesStore((s) => s.entries);
  const specialDays = useSpecialDaysStore((s) => s.specialDays);
  const reference = useSettingsStore((s) => s.settings.reference_hours_per_week);
  const periods = useActivityStore((s) => s.periods);
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
            specialDays={specialDays}
            reference={reference}
            periods={periods}
          />
        </>
      )}
    </div>
  );
}
