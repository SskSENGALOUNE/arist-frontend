import { create } from "zustand";
import { en, type Messages } from "./messages-en";
import { lo } from "./messages-lo";

export type Locale = "en" | "lo";

const STORAGE_KEY = "locale";
const DEFAULT_LOCALE: Locale = "en";

const messagesMap: Record<Locale, Messages> = { en, lo };

interface LocaleState {
  locale: Locale;
  hydrated: boolean;
  setLocale: (locale: Locale) => void;
  hydrate: () => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  hydrated: false,

  setLocale: (locale) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
      document.documentElement.lang = locale;
    }
    set({ locale });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(STORAGE_KEY);
    const locale: Locale = v === "en" || v === "lo" ? v : DEFAULT_LOCALE;
    document.documentElement.lang = locale;
    set({ locale, hydrated: true });
  },
}));

export function useT(): Messages {
  const locale = useLocaleStore((s) => s.locale);
  return messagesMap[locale];
}

export const locales: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "lo", label: "ລາວ" },
];
