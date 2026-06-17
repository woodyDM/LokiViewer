import { create } from "zustand";
import * as api from "../lib/tauri-commands";

export type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface UIState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  labelsPanelOpen: boolean;
  detailPanelOpen: boolean;
  wrapLines: boolean;
  showTimestamp: boolean;
  theme: Theme;

  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  toggleLabels: () => void;
  toggleDetail: () => void;
  toggleWrapLines: () => void;
  toggleTimestamp: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  loadPrefs: () => Promise<void>;
  savePrefs: () => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  sidebarWidth: 280,
  labelsPanelOpen: true,
  detailPanelOpen: false,
  wrapLines: false,
  showTimestamp: true,
  theme: "dark",

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarWidth: (w) => set({ sidebarWidth: Math.max(200, Math.min(500, w)) }),
  toggleLabels: () => set((s) => ({ labelsPanelOpen: !s.labelsPanelOpen })),
  toggleDetail: () => set((s) => ({ detailPanelOpen: !s.detailPanelOpen })),
  toggleWrapLines: () => {
    set((s) => ({ wrapLines: !s.wrapLines }));
    setTimeout(() => get().savePrefs(), 0);
  },
  toggleTimestamp: () => {
    set((s) => ({ showTimestamp: !s.showTimestamp }));
    setTimeout(() => get().savePrefs(), 0);
  },
  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
    setTimeout(() => get().savePrefs(), 0);
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
    setTimeout(() => get().savePrefs(), 0);
  },

  loadPrefs: async () => {
    try {
      const raw = await api.loadPrefs();
      const prefs = JSON.parse(raw);
      const theme: Theme = prefs.theme === "light" ? "light" : "dark";
      applyTheme(theme);
      set({
        theme,
        wrapLines: prefs.wrapLines === true,
        showTimestamp: prefs.showTimestamp !== false,
      });
    } catch {
      // defaults
      applyTheme("dark");
      set({ theme: "dark", wrapLines: false });
    }
  },

  savePrefs: async () => {
    const { theme, wrapLines, showTimestamp } = get();
    try {
      await api.savePrefs(JSON.stringify({ theme, wrapLines, showTimestamp }));
    } catch {
      // ignore
    }
  },
}));
