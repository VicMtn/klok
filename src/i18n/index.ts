import { useLocaleStore } from "../store/useLocaleStore";
import { fr } from "./fr";
import { en } from "./en";

export type Translations = typeof fr;
export type Locale = "fr" | "en";

export function useT(): Translations {
  const locale = useLocaleStore((s) => s.locale);
  return locale === "en" ? en : fr;
}

export function getT(): Translations {
  return useLocaleStore.getState().locale === "en" ? en : fr;
}
