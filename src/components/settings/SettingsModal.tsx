import { useState } from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useActivityStore } from "../../store/useActivityStore";
import { today } from "../../lib/dateUtils";
import { useT } from "../../i18n";

interface DraftPeriod {
  key: string;
  effective_from: string;
  ratePct: string; // percent, e.g. "60"
  days: string; // worked days per week, e.g. "3"
}

let draftSeq = 0;
const newKey = () => `p${draftSeq++}`;

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, update } = useSettingsStore();
  const periods = useActivityStore((s) => s.periods);
  const upsertPeriod = useActivityStore((s) => s.upsert);
  const removePeriod = useActivityStore((s) => s.remove);
  const t = useT();

  const [reference, setReference] = useState(String(settings.reference_hours_per_week));
  const [vacationDays, setVacationDays] = useState(String(settings.vacation_days_per_year));
  const [draft, setDraft] = useState<DraftPeriod[]>(() =>
    periods.map((p) => ({
      key: newKey(),
      effective_from: p.effective_from,
      ratePct: String(Math.round(p.activity_rate * 100)),
      days: String(p.worked_days_per_week),
    }))
  );

  const setRow = (key: string, patch: Partial<DraftPeriod>) =>
    setDraft((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const addRow = () =>
    setDraft((rows) => [
      ...rows,
      { key: newKey(), effective_from: today(), ratePct: "100", days: "5" },
    ]);

  const removeRow = (key: string) => setDraft((rows) => rows.filter((r) => r.key !== key));

  const handleSave = async () => {
    const parsedRef = parseFloat(reference);
    if (!isNaN(parsedRef) && parsedRef > 0 && parsedRef <= 168) {
      await update("reference_hours_per_week", parsedRef);
    }
    const parsedDays = parseFloat(vacationDays);
    if (!isNaN(parsedDays) && parsedDays >= 0 && parsedDays <= 366) {
      await update("vacation_days_per_year", parsedDays);
    }

    // Keep only valid, uniquely-dated periods; a later row wins a date collision.
    const byDate = new Map<string, { rate: number; days: number }>();
    for (const r of draft) {
      const pct = parseFloat(r.ratePct);
      const days = parseFloat(r.days);
      if (!r.effective_from || isNaN(pct) || pct <= 0 || pct > 100) continue;
      if (isNaN(days) || days < 1 || days > 7) continue;
      byDate.set(r.effective_from, { rate: pct / 100, days });
    }
    // Always keep at least one period so every date resolves a schedule.
    if (byDate.size === 0) byDate.set("1970-01-01", { rate: 1, days: 5 });

    const original = new Set(periods.map((p) => p.effective_from));
    for (const date of original) {
      if (!byDate.has(date)) await removePeriod(date);
    }
    for (const [date, { rate, days }] of byDate) {
      await upsertPeriod(date, rate, days);
    }

    onClose();
  };

  const inputCls =
    "border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500";

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-[32rem] max-h-[85vh] overflow-y-auto border border-transparent dark:border-gray-700">
        <h2 className="text-base font-semibold mb-5 text-gray-800 dark:text-gray-100">{t.settings.title}</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">
              {t.settings.referenceHoursPerWeek}
            </label>
            <input
              type="number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              step="0.5"
              min="1"
              max="168"
              className={`w-full ${inputCls}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                {t.settings.activityPeriods}
              </label>
              <button
                type="button"
                onClick={addRow}
                className="text-xs px-2 py-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                + {t.settings.addPeriod}
              </button>
            </div>
            <div className="grid grid-cols-[1fr_5rem_4rem_1.5rem] gap-2 px-1 mb-1 text-[11px] text-gray-400 dark:text-gray-500">
              <span>{t.settings.effectiveFrom}</span>
              <span className="text-center">{t.settings.activityRate}</span>
              <span className="text-center">{t.settings.workedDaysPerWeek}</span>
              <span />
            </div>
            <div className="space-y-2">
              {draft.map((r) => (
                <div key={r.key} className="grid grid-cols-[1fr_5rem_4rem_1.5rem] gap-2 items-center">
                  <input
                    type="date"
                    value={r.effective_from}
                    onChange={(e) => setRow(r.key, { effective_from: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    value={r.ratePct}
                    onChange={(e) => setRow(r.key, { ratePct: e.target.value })}
                    min="1"
                    max="100"
                    step="1"
                    className={`text-center ${inputCls}`}
                  />
                  <input
                    type="number"
                    value={r.days}
                    onChange={(e) => setRow(r.key, { days: e.target.value })}
                    min="1"
                    max="7"
                    step="1"
                    className={`text-center ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(r.key)}
                    title={t.settings.removePeriod}
                    disabled={draft.length <= 1}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">
              {t.settings.vacationDaysPerYear}
            </label>
            <select
              value={vacationDays}
              onChange={(e) => setVacationDays(e.target.value)}
              className={`w-full ${inputCls}`}
            >
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="30">30</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {t.settings.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {t.settings.save}
          </button>
        </div>
      </div>
    </div>
  );
}
