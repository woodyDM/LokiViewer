import { create } from "zustand";
import type { LokiSource } from "../types/loki";
import * as api from "../lib/tauri-commands";

interface SourcesState {
  sources: LokiSource[];
  activeSourceId: string | null;
  isLoading: boolean;
  error: string | null;

  loadSources: () => Promise<void>;
  addSource: (
    name: string,
    url: string,
    tenantId?: string,
    username?: string,
    password?: string,
  ) => Promise<void>;
  updateSource: (source: LokiSource) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  setActiveSource: (id: string) => Promise<void>;
  testConnection: (source: LokiSource) => Promise<boolean>;
}

export const useSourcesStore = create<SourcesState>((set) => ({
  sources: [],
  activeSourceId: null,
  isLoading: false,
  error: null,

  loadSources: async () => {
    set({ isLoading: true, error: null });
    try {
      const sources = await api.listSources();
      const active = sources.find((s) => s.is_active);
      set({
        sources,
        activeSourceId: active?.id ?? null,
        isLoading: false,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: String(e),
      });
    }
  },

  addSource: async (name, url, tenantId, username, password) => {
    try {
      const source = await api.addSource(name, url, tenantId, username, password);
      set((state) => ({ sources: [...state.sources, source] }));
    } catch (e) {
      throw new Error(String(e));
    }
  },

  updateSource: async (source) => {
    try {
      await api.updateSource(source);
      set((state) => ({
        sources: state.sources.map((s) => (s.id === source.id ? source : s)),
      }));
    } catch (e) {
      throw new Error(String(e));
    }
  },

  deleteSource: async (id) => {
    try {
      await api.deleteSource(id);
      set((state) => ({
        sources: state.sources.filter((s) => s.id !== id),
        activeSourceId:
          state.activeSourceId === id ? null : state.activeSourceId,
      }));
    } catch (e) {
      throw new Error(String(e));
    }
  },

  setActiveSource: async (id) => {
    try {
      await api.setActiveSource(id);
      set((state) => ({
        activeSourceId: id,
        sources: state.sources.map((s) => ({
          ...s,
          is_active: s.id === id,
        })),
      }));
    } catch (e) {
      throw new Error(String(e));
    }
  },

  testConnection: async (source) => {
    return api.testConnection(source);
  },
}));
