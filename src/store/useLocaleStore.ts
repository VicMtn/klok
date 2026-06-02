import { create } from "zustand";
import type { Locale } from "../i18n";

interface LocaleState {
  locale: Locale;
  toggle: () => void;
}

const stored = (localStorage.getItem("klok-locale") as Locale) ?? "fr";

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: stored,
  toggle: () => {
    const next: Locale = get().locale === "fr" ? "en" : "fr";
    localStorage.setItem("klok-locale", next);
    set({ locale: next });
  },
}));
