import { useEffect, useRef } from "react";
import { useQueryStore } from "../stores/queryStore";
import { useSourcesStore } from "../stores/sourcesStore";
import { useLogsStore } from "../stores/logsStore";
import { DEFAULT_LIMIT } from "../lib/constants";

const DURATION_MAP: Record<string, number> = {
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "3h": 3 * 60 * 60_000,
  "6h": 6 * 60 * 60_000,
  "12h": 12 * 60 * 60_000,
  "24h": 24 * 60 * 60_000,
};

export function useAutoRefresh() {
  const refreshInterval = useQueryStore((s) => s.refreshInterval);
  const isAutoRefreshing = useQueryStore((s) => s.isAutoRefreshing);
  const currentQuery = useQueryStore((s) => s.currentQuery);
  const timeRange = useQueryStore((s) => s.timeRange);
  const activeSourceId = useSourcesStore((s) => s.activeSourceId);
  const executeQuery = useLogsStore((s) => s.executeQuery);
  const isLoading = useLogsStore((s) => s.isLoading);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isAutoRefreshing || !refreshInterval || !activeSourceId || !currentQuery) {
      return;
    }

    const runQuery = () => {
      if (isLoading) return;

      const now = Date.now();
      let start: number;
      let end: number = now;

      if (timeRange.type === "custom") {
        start = timeRange.start;
        end = timeRange.end;
      } else {
        const duration = DURATION_MAP[timeRange.value] ?? 5 * 60_000;
        start = now - duration;
      }

      executeQuery({
        source_id: activeSourceId,
        query: currentQuery,
        start: start * 1_000_000,
        end: end * 1_000_000,
        limit: DEFAULT_LIMIT,
        direction: "backward",
      });
    };

    // Run immediately, then on interval
    runQuery();
    timerRef.current = setInterval(runQuery, refreshInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    isAutoRefreshing,
    refreshInterval,
    currentQuery,
    timeRange,
    activeSourceId,
    executeQuery,
    isLoading,
  ]);
}
