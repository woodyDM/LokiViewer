import { create } from "zustand";
import type { TimePreset, TimeRange } from "../types/query";
import { loadLastQuery, saveQueryHistory as apiSaveHistory, loadQueryHistory as apiLoadHistory } from "../lib/tauri-commands";

export interface QueryHistoryEntry {
  query: string;
  timeRange: TimeRange;
  timestamp: number;
  queryTime?: number;
}

interface QueryState {
  currentQuery: string;
  queryHistory: string[];
  timeRange: TimeRange;
  refreshInterval: number | null;
  isAutoRefreshing: boolean;
  savedQueries: QueryHistoryEntry[];

  setQuery: (q: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setRefreshInterval: (ms: number | null) => void;
  toggleAutoRefresh: () => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  loadPersistedQuery: () => Promise<void>;
  saveQueryEntry: (query: string, timeRange: TimeRange, queryTime?: number) => Promise<void>;
  loadSavedQueries: () => Promise<void>;
  applySavedQuery: (entry: QueryHistoryEntry) => void;
}

const PRESET_5M: TimePreset = "5m";

export const useQueryStore = create<QueryState>((set, get) => ({
  currentQuery: '{app="my-app"}',
  queryHistory: [],
  timeRange: { type: "preset", value: PRESET_5M },
  refreshInterval: null,
  isAutoRefreshing: false,
  savedQueries: [],

  setQuery: (q) => set({ currentQuery: q }),

  setTimeRange: (range) => set({ timeRange: range }),

  setRefreshInterval: (ms) => {
    set({
      refreshInterval: ms,
      isAutoRefreshing: ms !== null,
    });
  },

  toggleAutoRefresh: () => {
    const { isAutoRefreshing, refreshInterval } = get();
    if (isAutoRefreshing) {
      set({ isAutoRefreshing: false });
    } else if (refreshInterval) {
      set({ isAutoRefreshing: true });
    }
  },

  addToHistory: (query) => {
    set((state) => ({
      queryHistory: [
        query,
        ...state.queryHistory.filter((q) => q !== query),
      ].slice(0, 50),
    }));
  },

  clearHistory: () => set({ queryHistory: [] }),

  loadPersistedQuery: async () => {
    try {
      const raw = await loadLastQuery();
      if (!raw) return;
      // Try JSON format { query, timeRange }
      try {
        const parsed = JSON.parse(raw);
        if (parsed.query) {
          set({ currentQuery: parsed.query });
          if (parsed.timeRange) {
            set({ timeRange: parsed.timeRange });
          }
          return;
        }
      } catch {
        // Old format: plain string
      }
      set({ currentQuery: raw });
    } catch {
      // ignore
    }
  },

  saveQueryEntry: async (query, timeRange, queryTime) => {
    const entry: QueryHistoryEntry = { query, timeRange, timestamp: Date.now(), queryTime };
    const { savedQueries } = get();
    // Remove duplicate (same query + same time range)
    const filtered = savedQueries.filter(
      (e) => !(e.query === query && JSON.stringify(e.timeRange) === JSON.stringify(timeRange)),
    );
    const next = [entry, ...filtered].slice(0, 10);
    set({ savedQueries: next });
    try {
      await apiSaveHistory(JSON.stringify(next));
    } catch {
      // ignore
    }
  },

  loadSavedQueries: async () => {
    try {
      const raw = await apiLoadHistory();
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        set({ savedQueries: arr.slice(0, 10) });
      }
    } catch {
      // ignore
    }
  },

  applySavedQuery: (entry) => {
    set({
      currentQuery: entry.query,
      timeRange: entry.timeRange,
    });
  },
}));
