import { create } from "zustand";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

// Apply persisted preference before first render
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

export const useThemeStore = create<ThemeState>((set) => ({
  dark: localStorage.getItem("theme") === "dark",
  toggle: () =>
    set((s) => {
      const next = !s.dark;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return { dark: next };
    }),
}));
