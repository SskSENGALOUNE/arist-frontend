import { create } from "zustand";

export type FontSize = "sm" | "md" | "lg" | "xl";

export const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "18px",
  md: "20px",
  lg: "22px",
  xl: "25px",
};

const FONT_STORAGE_KEY = "ui-font-size";
const DARK_STORAGE_KEY = "ui-dark-mode";
const DEFAULT_SIZE: FontSize = "lg";

interface SettingsState {
  fontSize: FontSize;
  darkMode: boolean;
  hydrated: boolean;
  setFontSize: (size: FontSize) => void;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  hydrate: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fontSize: DEFAULT_SIZE,
  darkMode: false,
  hydrated: false,

  setFontSize: (fontSize) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FONT_STORAGE_KEY, fontSize);
      document.documentElement.style.fontSize = FONT_SIZE_PX[fontSize];
    }
    set({ fontSize });
  },

  setDarkMode: (dark) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DARK_STORAGE_KEY, String(dark));
      document.documentElement.classList.toggle("dark", dark);
    }
    set({ darkMode: dark });
  },

  toggleDarkMode: () => {
    get().setDarkMode(!get().darkMode);
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FONT_STORAGE_KEY) as FontSize | null;
    const fontSize: FontSize =
      stored && stored in FONT_SIZE_PX ? stored : DEFAULT_SIZE;
    document.documentElement.style.fontSize = FONT_SIZE_PX[fontSize];

    const darkStored = window.localStorage.getItem(DARK_STORAGE_KEY);
    const darkMode = darkStored === "true";
    document.documentElement.classList.toggle("dark", darkMode);

    set({ fontSize, darkMode, hydrated: true });
  },
}));
