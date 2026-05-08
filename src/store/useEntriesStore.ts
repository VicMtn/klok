import { create } from "zustand";
import type { TimeEntry } from "../types/entry";
import {
  getEntriesForWeek,
  getEntriesForMonth,
  updateEntryField,
} from "../lib/db";

interface EntriesState {
  entries: Map<string, TimeEntry>;
  loading: boolean;
  loadWeek: (weekStart: string, weekEnd: string) => Promise<void>;
  loadMonth: (year: number, month: number) => Promise<void>;
  updateField: (
    date: string,
    field: keyof TimeEntry,
    value: string | null
  ) => Promise<void>;
  stampField: (date: string, field: keyof TimeEntry) => Promise<void>;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  entries: new Map(),
  loading: false,

  loadWeek: async (weekStart, weekEnd) => {
    set({ loading: true });
    const rows = await getEntriesForWeek(weekStart, weekEnd);
    set({ entries: new Map(rows.map((r) => [r.date, r])), loading: false });
  },

  loadMonth: async (year, month) => {
    set({ loading: true });
    const rows = await getEntriesForMonth(year, month);
    set({ entries: new Map(rows.map((r) => [r.date, r])), loading: false });
  },

  updateField: async (date, field, value) => {
    const existing = get().entries.get(date) ?? {
      date,
      arrival: null,
      break_start: null,
      break_end: null,
      departure: null,
      comment: null,
    };
    const updated = { ...existing, [field]: value };

    set((state) => {
      const next = new Map(state.entries);
      next.set(date, updated);
      return { entries: next };
    });

    try {
      await updateEntryField(date, field as string, value);
    } catch (err) {
      set((state) => {
        const next = new Map(state.entries);
        next.set(date, existing);
        return { entries: next };
      });
      throw err;
    }
  },

  stampField: async (date, field) => {
    const now = new Date();
    const value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    await get().updateField(date, field, value);
  },
}));
