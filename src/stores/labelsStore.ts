import { create } from "zustand";
import type { LabelKey } from "../types/loki";
import * as api from "../lib/tauri-commands";

interface LabelsState {
  labels: LabelKey[];
  isLoading: boolean;
  isValuesLoading: Set<string>;
  searchFilter: string;
  error: string | null;

  fetchLabels: (sourceId: string, start?: number, end?: number) => Promise<void>;
  fetchLabelValues: (sourceId: string, name: string, start?: number, end?: number) => Promise<void>;
  setSearchFilter: (filter: string) => void;
  clearLabels: () => void;
  appendLabelToQuery: (labelName: string, labelValue: string) => string;
}

export const useLabelsStore = create<LabelsState>((set, get) => ({
  labels: [],
  isLoading: false,
  isValuesLoading: new Set(),
  searchFilter: "",
  error: null,

  fetchLabels: async (sourceId, start, end) => {
    set({ isLoading: true, error: null });
    try {
      const labels = await api.queryLabels(sourceId, start, end);
      set({ labels, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  fetchLabelValues: async (sourceId, name, start, end) => {
    const { isValuesLoading } = get();
    if (isValuesLoading.has(name)) return;

    const newLoading = new Set(isValuesLoading);
    newLoading.add(name);
    set({ isValuesLoading: newLoading });

    try {
      const values = await api.queryLabelValues(sourceId, name, start, end);
      set((state) => ({
        labels: state.labels.map((l) =>
          l.name === name ? { ...l, values, values_loaded: true } : l,
        ),
        isValuesLoading: new Set(
          [...state.isValuesLoading].filter((n) => n !== name),
        ),
      }));
    } catch {
      set((state) => ({
        isValuesLoading: new Set(
          [...state.isValuesLoading].filter((n) => n !== name),
        ),
      }));
    }
  },

  setSearchFilter: (filter) => set({ searchFilter: filter }),

  clearLabels: () =>
    set({
      labels: [],
      isLoading: false,
      isValuesLoading: new Set(),
      error: null,
    }),

  appendLabelToQuery: (labelName, labelValue) => {
    const filter = `${labelName}="${labelValue}"`;
    return filter;
  },
}));
