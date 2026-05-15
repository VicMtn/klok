import { create } from "zustand";
import type { Holiday } from "../types/entry";
import { getHolidaysForRange, getHolidaysForYear, upsertHoliday, deleteHoliday } from "../lib/db";

interface HolidaysState {
  holidays: Map<string, Holiday>;
  loadRange: (start: string, end: string) => Promise<void>;
  loadYear: (year: number) => Promise<void>;
  toggle: (date: string) => Promise<void>;
  updateLabel: (date: string, label: string | null) => Promise<void>;
}

export const useHolidaysStore = create<HolidaysState>((set, get) => ({
  holidays: new Map(),

  loadRange: async (start, end) => {
    const rows = await getHolidaysForRange(start, end);
    set((state) => {
      const next = new Map(state.holidays);
      for (const [k] of state.holidays) {
        if (k >= start && k <= end) next.delete(k);
      }
      for (const h of rows) next.set(h.date, h);
      return { holidays: next };
    });
  },

  loadYear: async (year) => {
    const rows = await getHolidaysForYear(year);
    set({ holidays: new Map(rows.map((h) => [h.date, h])) });
  },

  toggle: async (date) => {
    const existing = get().holidays.get(date);
    if (existing) {
      await deleteHoliday(date);
      set((state) => {
        const next = new Map(state.holidays);
        next.delete(date);
        return { holidays: next };
      });
    } else {
      await upsertHoliday(date, null);
      set((state) => {
        const next = new Map(state.holidays);
        next.set(date, { date, label: null });
        return { holidays: next };
      });
    }
  },

  updateLabel: async (date, label) => {
    const trimmed = label?.trim() || null;
    await upsertHoliday(date, trimmed);
    set((state) => {
      const next = new Map(state.holidays);
      const existing = state.holidays.get(date);
      if (existing) next.set(date, { ...existing, label: trimmed });
      return { holidays: next };
    });
  },
}));
