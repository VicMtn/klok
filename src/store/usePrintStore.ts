import { create } from "zustand";

interface PrintStore {
  dates: string[];
  title: string;
  setPrint: (dates: string[], title: string) => void;
}

export const usePrintStore = create<PrintStore>((set) => ({
  dates: [],
  title: "",
  setPrint: (dates, title) => set({ dates, title }),
}));
