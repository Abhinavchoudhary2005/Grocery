import { create } from "zustand";

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("app-theme") || "emerald",

  setTheme: (theme) => {
    localStorage.setItem("app-theme", theme);
    set({ theme });
  },
}));
