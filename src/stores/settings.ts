import { create } from "zustand";

export type FontSize = "sm" | "md" | "lg" | "xl";

export const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "18px",
  md: "20px",
  lg: "22px",
  xl: "25px",
};

const STORAGE_KEY = "ui-font-size";
const DEFAULT_SIZE: FontSize = "lg";

interface SettingsState {
  fontSize: FontSize;
  hydrated: boolean;
  setFontSize: (size: FontSize) => void;
  hydrate: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: DEFAULT_SIZE,
  hydrated: false,

  setFontSize: (fontSize) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, fontSize);
      document.documentElement.style.fontSize = FONT_SIZE_PX[fontSize];
    }
    set({ fontSize });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as FontSize | null;
    const fontSize: FontSize =
      stored && stored in FONT_SIZE_PX ? stored : DEFAULT_SIZE;
    document.documentElement.style.fontSize = FONT_SIZE_PX[fontSize];
    set({ fontSize, hydrated: true });
  },
}));
