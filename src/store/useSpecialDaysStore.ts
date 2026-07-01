import { create } from "zustand";
import type { SpecialDay, SpecialDayType } from "../types/entry";
import {
  getSpecialDaysForRange,
  getSpecialDaysForYear,
  upsertSpecialDay,
  deleteSpecialDay,
} from "../lib/db";
import { reportWriteError } from "../lib/errors";

interface SpecialDaysState {
  specialDays: Map<string, SpecialDay>;
  loadRange: (start: string, end: string) => Promise<void>;
  loadYear: (year: number) => Promise<void>;
  // Set or replace a date's status. A date holds exactly one type.
  setType: (date: string, type: SpecialDayType, label?: string | null) => Promise<void>;
  updateLabel: (date: string, label: string | null) => Promise<void>;
  remove: (date: string) => Promise<void>;
}

export const useSpecialDaysStore = create<SpecialDaysState>((set, get) => ({
  specialDays: new Map(),

  loadRange: async (start, end) => {
    const rows = await getSpecialDaysForRange(start, end);
    set((state) => {
      const next = new Map(state.specialDays);
      for (const [k] of state.specialDays) {
        if (k >= start && k <= end) next.delete(k);
      }
      for (const s of rows) next.set(s.date, s);
      return { specialDays: next };
    });
  },

  loadYear: async (year) => {
    const rows = await getSpecialDaysForYear(year);
    set({ specialDays: new Map(rows.map((s) => [s.date, s])) });
  },

  setType: async (date, type, label = null) => {
    const existing = get().specialDays.get(date);
    set((state) => {
      const next = new Map(state.specialDays);
      next.set(date, { ...existing, date, type, label });
      return { specialDays: next };
    });
    try {
      await upsertSpecialDay(date, type, label);
    } catch (err) {
      reportWriteError("special day set failed", err);
      set((state) => {
        const next = new Map(state.specialDays);
        if (existing) next.set(date, existing);
        else next.delete(date);
        return { specialDays: next };
      });
    }
  },

  updateLabel: async (date, label) => {
    const trimmed = label?.trim() || null;
    const existing = get().specialDays.get(date);
    if (!existing) return;
    set((state) => {
      const next = new Map(state.specialDays);
      next.set(date, { ...existing, label: trimmed });
      return { specialDays: next };
    });
    try {
      await upsertSpecialDay(date, existing.type, trimmed);
    } catch (err) {
      reportWriteError("special day label update failed", err);
      set((state) => {
        const next = new Map(state.specialDays);
        next.set(date, existing);
        return { specialDays: next };
      });
    }
  },

  remove: async (date) => {
    const existing = get().specialDays.get(date);
    if (!existing) return;
    set((state) => {
      const next = new Map(state.specialDays);
      next.delete(date);
      return { specialDays: next };
    });
    try {
      await deleteSpecialDay(date);
    } catch (err) {
      reportWriteError("special day remove failed", err);
      set((state) => {
        const next = new Map(state.specialDays);
        next.set(date, existing);
        return { specialDays: next };
      });
    }
  },
}));
