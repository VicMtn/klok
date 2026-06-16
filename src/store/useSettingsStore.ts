import { create } from "zustand";
import { getAllSettings, setSetting } from "../lib/db";

interface Settings {
  expected_hours_per_week: number;
  week_starts_on: number;
  vacation_days_per_year: number;
}

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (key: keyof Settings, value: number) => Promise<void>;
}

const defaults: Settings = {
  expected_hours_per_week: 37.5,
  week_starts_on: 1,
  vacation_days_per_year: 20,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaults,
  loaded: false,

  load: async () => {
    const raw = await getAllSettings();
    set({
      settings: {
        expected_hours_per_week: raw.expected_hours_per_week
          ? parseFloat(raw.expected_hours_per_week)
          : defaults.expected_hours_per_week,
        week_starts_on: raw.week_starts_on
          ? parseInt(raw.week_starts_on, 10)
          : defaults.week_starts_on,
        vacation_days_per_year: raw.vacation_days_per_year
          ? parseFloat(raw.vacation_days_per_year)
          : defaults.vacation_days_per_year,
      },
      loaded: true,
    });
  },

  update: async (key, value) => {
    await setSetting(key, String(value));
    set((state) => ({ settings: { ...state.settings, [key]: value } }));
  },
}));
