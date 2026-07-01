import { create } from "zustand";
import type { SickDay } from "../types/entry";
import {
  getSickDaysForRange,
  getSickDaysForYear,
  upsertSickDay,
  deleteSickDay,
} from "../lib/db";

interface SickDaysState {
  sickDays: Map<string, SickDay>;
  loadRange: (start: string, end: string) => Promise<void>;
  loadYear: (year: number) => Promise<void>;
  toggle: (date: string) => Promise<void>;
}

export const useSickDaysStore = create<SickDaysState>((set, get) => ({
  sickDays: new Map(),

  loadRange: async (start, end) => {
    const rows = await getSickDaysForRange(start, end);
    set((state) => {
      const next = new Map(state.sickDays);
      for (const [k] of state.sickDays) {
        if (k >= start && k <= end) next.delete(k);
      }
      for (const s of rows) next.set(s.date, s);
      return { sickDays: next };
    });
  },

  loadYear: async (year) => {
    const rows = await getSickDaysForYear(year);
    set({ sickDays: new Map(rows.map((s) => [s.date, s])) });
  },

  toggle: async (date) => {
    const existing = get().sickDays.get(date);
    // Optimistic update first so the UI reacts immediately
    set((state) => {
      const next = new Map(state.sickDays);
      if (existing) next.delete(date);
      else next.set(date, { date });
      return { sickDays: next };
    });
    try {
      if (existing) await deleteSickDay(date);
      else await upsertSickDay(date);
    } catch (err) {
      console.error("sick day toggle failed", err);
      // Revert on failure
      set((state) => {
        const next = new Map(state.sickDays);
        if (existing) next.set(date, existing);
        else next.delete(date);
        return { sickDays: next };
      });
    }
  },
}));
