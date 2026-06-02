import { useState } from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useT } from "../../i18n";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, update } = useSettingsStore();
  const t = useT();
  const [hours, setHours] = useState(String(settings.expected_hours_per_week));

  const handleSave = async () => {
    const parsed = parseFloat(hours);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 168) {
      await update("expected_hours_per_week", parsed);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-80 border border-transparent dark:border-gray-700">
        <h2 className="text-base font-semibold mb-5 text-gray-800 dark:text-gray-100">{t.settings.title}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">
              {t.settings.hoursPerWeek}
            </label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              step="0.5"
              min="1"
              max="168"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
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
