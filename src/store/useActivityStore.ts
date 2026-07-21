import { create } from "zustand";
import type { ActivityPeriod } from "../types/entry";
import {
  getActivityPeriods,
  upsertActivityPeriod,
  deleteActivityPeriod,
} from "../lib/db";
import { reportWriteError } from "../lib/errors";

interface ActivityState {
  periods: ActivityPeriod[];
  loaded: boolean;
  load: () => Promise<void>;
  upsert: (
    effectiveFrom: string,
    activityRate: number,
    workedDaysPerWeek: number
  ) => Promise<void>;
  remove: (effectiveFrom: string) => Promise<void>;
}

const sortPeriods = (p: ActivityPeriod[]) =>
  [...p].sort((a, b) => a.effective_from.localeCompare(b.effective_from));

export const useActivityStore = create<ActivityState>((set, get) => ({
  periods: [],
  loaded: false,

  load: async () => {
    const rows = await getActivityPeriods();
    set({ periods: sortPeriods(rows), loaded: true });
  },

  upsert: async (effectiveFrom, activityRate, workedDaysPerWeek) => {
    const previous = get().periods;
    const next = sortPeriods([
      ...previous.filter((p) => p.effective_from !== effectiveFrom),
      {
        effective_from: effectiveFrom,
        activity_rate: activityRate,
        worked_days_per_week: workedDaysPerWeek,
      },
    ]);
    set({ periods: next });
    try {
      await upsertActivityPeriod(effectiveFrom, activityRate, workedDaysPerWeek);
    } catch (err) {
      reportWriteError("activity period upsert failed", err);
      set({ periods: previous });
    }
  },

  remove: async (effectiveFrom) => {
    const previous = get().periods;
    set({ periods: previous.filter((p) => p.effective_from !== effectiveFrom) });
    try {
      await deleteActivityPeriod(effectiveFrom);
    } catch (err) {
      reportWriteError("activity period remove failed", err);
      set({ periods: previous });
    }
  },
}));
