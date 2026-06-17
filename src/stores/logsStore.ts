import { create } from "zustand";
import type { QueryResult, QueryRequest, Stream } from "../types/loki";
import type { FlatLogEntry, LogLevel } from "../types/query";
import * as api from "../lib/tauri-commands";
import { useQueryStore } from "./queryStore";

export interface LogsState {
  streams: Stream[];
  flatEntries: FlatLogEntry[];
  totalEntries: number;
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  hasMore: boolean;
  queryTime: number | null;

  expandedRows: Set<string>;

  executeQuery: (request: QueryRequest) => Promise<void>;
  cancelQuery: () => Promise<void>;
  loadMore: (request: QueryRequest, lastTimestampNano: number) => Promise<void>;
  clearLogs: () => void;
  toggleRowExpanded: (key: string) => void;
}

function detectLogLevel(line: string): LogLevel {
  const upper = line.toUpperCase();
  if (upper.includes("FATAL") || upper.includes("CRIT")) return "fatal";
  if (upper.includes("ERROR")) return "error";
  if (upper.includes("WARN") || upper.includes("WARNING")) return "warn";
  if (upper.includes("INFO")) return "info";
  if (upper.includes("DEBUG") || upper.includes("TRACE")) return "debug";
  return "unknown";
}

function flattenStreams(streams: Stream[]): FlatLogEntry[] {
  const entries: FlatLogEntry[] = [];

  for (const stream of streams) {
    for (const [timestampNano, line] of stream.values) {
      const tsNs = BigInt(timestampNano);
      const tsMs = Number(tsNs / BigInt(1_000_000));
      const d = new Date(tsMs);

      entries.push({
        key: `${timestampNano}-${entries.length}`,
        timestamp: d.toLocaleString("zh-CN", {
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        timestampNano: Number(tsNs),
        line,
        labels: stream.stream,
        logLevel: detectLogLevel(line),
      });
    }
  }

  entries.sort((a, b) => b.timestampNano - a.timestampNano);
  return entries;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  streams: [],
  flatEntries: [],
  totalEntries: 0,
  isLoading: false,
  isRunning: false,
  error: null,
  hasMore: false,
  queryTime: null,

  expandedRows: new Set(),

  executeQuery: async (request) => {
    const startTime = performance.now();
    set({ isLoading: true, isRunning: true, error: null, queryTime: null });
    try {
      const result: QueryResult = await api.executeQuery(request);
      const elapsed = Math.round(performance.now() - startTime);
      const sorted = result.data.result || [];
      const entries = flattenStreams(sorted);

      set({
        streams: sorted,
        flatEntries: entries,
        totalEntries: entries.length,
        isLoading: false,
        isRunning: false,
        hasMore: entries.length >= request.limit,
        expandedRows: new Set(),
        queryTime: elapsed,
      });

      // Persist last query + time range
      const { currentQuery, timeRange, saveQueryEntry } = useQueryStore.getState();
      api.saveLastQuery(JSON.stringify({ query: currentQuery, timeRange })).catch(() => {});
      saveQueryEntry(currentQuery, timeRange, elapsed);
    } catch (e: any) {
      const elapsed = Math.round(performance.now() - startTime);
      const msg =
        typeof e === "string"
          ? e
          : e?.message || e?.toString?.() || String(e);
      set({
        isLoading: false,
        isRunning: false,
        error: msg,
        queryTime: elapsed,
      });
    }
  },

  cancelQuery: async () => {
    try {
      await api.cancelQuery();
    } catch {
      // ignore cancellation errors
    }
    set({ isLoading: false, isRunning: false, error: "查询已取消" });
  },

  loadMore: async (request, lastTimestampNano) => {
    const { isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;

    const loadMoreRequest = {
      ...request,
      end: lastTimestampNano - 1,
      direction: "backward" as const,
    };

    set({ isLoading: true });
    try {
      const result: QueryResult = await api.executeQuery(loadMoreRequest);
      const newStreams = result.data.result || [];
      if (newStreams.length === 0) {
        set({ isLoading: false, hasMore: false });
        return;
      }

      const newEntries = flattenStreams(newStreams);
      set((state) => ({
        streams: [...state.streams, ...newStreams],
        flatEntries: [...state.flatEntries, ...newEntries],
        totalEntries: state.totalEntries + newEntries.length,
        isLoading: false,
        hasMore: newEntries.length >= request.limit,
      }));
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  clearLogs: () => {
    set({
      streams: [],
      flatEntries: [],
      totalEntries: 0,
      error: null,
      hasMore: false,
      expandedRows: new Set(),
      queryTime: null,
      isRunning: false,
    });
  },

  toggleRowExpanded: (key) => {
    set((state) => {
      const next = new Set(state.expandedRows);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { expandedRows: next };
    });
  },
}));
