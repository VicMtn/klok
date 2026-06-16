import { create } from "zustand";
import type { Vacation } from "../types/entry";
import {
  getVacationsForRange,
  getVacationsForYear,
  upsertVacation,
  deleteVacation,
} from "../lib/db";

interface VacationsState {
  vacations: Map<string, Vacation>;
  loadRange: (start: string, end: string) => Promise<void>;
  loadYear: (year: number) => Promise<void>;
  toggle: (date: string) => Promise<void>;
}

export const useVacationsStore = create<VacationsState>((set, get) => ({
  vacations: new Map(),

  loadRange: async (start, end) => {
    const rows = await getVacationsForRange(start, end);
    set((state) => {
      const next = new Map(state.vacations);
      for (const [k] of state.vacations) {
        if (k >= start && k <= end) next.delete(k);
      }
      for (const v of rows) next.set(v.date, v);
      return { vacations: next };
    });
  },

  loadYear: async (year) => {
    const rows = await getVacationsForYear(year);
    set({ vacations: new Map(rows.map((v) => [v.date, v])) });
  },

  toggle: async (date) => {
    const existing = get().vacations.get(date);
    // Optimistic update first so the UI reacts immediately
    set((state) => {
      const next = new Map(state.vacations);
      if (existing) next.delete(date);
      else next.set(date, { date });
      return { vacations: next };
    });
    try {
      if (existing) await deleteVacation(date);
      else await upsertVacation(date);
    } catch (err) {
      console.error("vacation toggle failed", err);
      // Revert on failure
      set((state) => {
        const next = new Map(state.vacations);
        if (existing) next.set(date, existing);
        else next.delete(date);
        return { vacations: next };
      });
    }
  },
}));
