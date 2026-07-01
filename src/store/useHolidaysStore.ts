import { create } from "zustand";
import type { Holiday } from "../types/entry";
import { getHolidaysForRange, getHolidaysForYear, upsertHoliday, deleteHoliday } from "../lib/db";
import { reportWriteError } from "../lib/errors";

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
    // Optimistic update first so the UI reacts immediately
    set((state) => {
      const next = new Map(state.holidays);
      if (existing) next.delete(date);
      else next.set(date, { date, label: null });
      return { holidays: next };
    });
    try {
      if (existing) await deleteHoliday(date);
      else await upsertHoliday(date, null);
    } catch (err) {
      reportWriteError("holiday toggle failed", err);
      // Revert on failure
      set((state) => {
        const next = new Map(state.holidays);
        if (existing) next.set(date, existing);
        else next.delete(date);
        return { holidays: next };
      });
    }
  },

  updateLabel: async (date, label) => {
    const trimmed = label?.trim() || null;
    const existing = get().holidays.get(date);
    if (!existing) return;
    set((state) => {
      const next = new Map(state.holidays);
      next.set(date, { ...existing, label: trimmed });
      return { holidays: next };
    });
    try {
      await upsertHoliday(date, trimmed);
    } catch (err) {
      reportWriteError("holiday label update failed", err);
      set((state) => {
        const next = new Map(state.holidays);
        next.set(date, existing);
        return { holidays: next };
      });
    }
  },
}));
