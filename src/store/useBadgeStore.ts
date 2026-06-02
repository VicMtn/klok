import { create } from "zustand";
import type { TimeEntry, TimeField } from "../types/entry";
import { today } from "../lib/dateUtils";
import { useEntriesStore } from "./useEntriesStore";

export type BadgeState = 0 | 1 | 2 | 3 | 4;

function inferState(entry: TimeEntry | undefined): BadgeState {
  if (!entry) return 0;
  if (entry.departure) return 4;
  if (entry.break_end) return 3;
  if (entry.break_start) return 2;
  if (entry.arrival) return 1;
  return 0;
}

const FIELD_FOR_STATE: Record<number, TimeField | null> = {
  0: "arrival",
  1: "break_start",
  2: "break_end",
  3: "departure",
  4: null,
};

interface BadgeStoreState {
  state: BadgeState;
  hydrate: (entry: TimeEntry | undefined) => void;
  stamp: () => Promise<void>;
}

export const useBadgeStore = create<BadgeStoreState>((set, get) => ({
  state: 0,

  hydrate: (entry) => set({ state: inferState(entry) }),

  stamp: async () => {
    const { state } = get();
    const field = FIELD_FOR_STATE[state];
    if (!field) return;
    await useEntriesStore.getState().stampField(today(), field);
    set({ state: (state + 1) as BadgeState });
  },
}));
