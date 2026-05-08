import { useState } from "react";
import { useSettingsStore } from "../../store/useSettingsStore";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, update } = useSettingsStore();
  const [hours, setHours] = useState(String(settings.expected_hours_per_day));

  const handleSave = async () => {
    const parsed = parseFloat(hours);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 24) {
      await update("expected_hours_per_day", parsed);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl p-6 w-80">
        <h2 className="text-base font-semibold mb-5">Paramètres</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Heures attendues par jour
            </label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              step="0.5"
              min="1"
              max="24"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
