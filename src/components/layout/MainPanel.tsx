import { useSourcesStore } from "../../stores/sourcesStore";
import { EmptyState } from "../shared/EmptyState";
import { QueryInput } from "../query/QueryInput";
import { TimeRangePicker } from "../query/TimeRangePicker";
import { LogList } from "../logs/LogList";
import { useLogsStore } from "../../stores/logsStore";
import { useQueryStore } from "../../stores/queryStore";
import { useUIStore } from "../../stores/uiStore";
import { DEFAULT_LIMIT } from "../../lib/constants";
import { useState, useRef, useEffect } from "react";
import { WrapText, Square, Sun, Moon, Clock, EyeOff } from "lucide-react";

export function MainPanel() {
  const activeSourceId = useSourcesStore((s) => s.activeSourceId);
  const sources = useSourcesStore((s) => s.sources);
  const currentQuery = useQueryStore((s) => s.currentQuery);
  const timeRange = useQueryStore((s) => s.timeRange);
  const wrapLines = useUIStore((s) => s.wrapLines);
  const toggleWrapLines = useUIStore((s) => s.toggleWrapLines);
  const showTimestamp = useUIStore((s) => s.showTimestamp);
  const toggleTimestamp = useUIStore((s) => s.toggleTimestamp);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const { executeQuery, cancelQuery, isLoading, isRunning, error, totalEntries, queryTime } =
    useLogsStore();
  const savedQueries = useQueryStore((s) => s.savedQueries);
  const applySavedQuery = useQueryStore((s) => s.applySavedQuery);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showHistory) return;
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHistory]);

  const activeSource = sources.find((s) => s.id === activeSourceId);

  const handleRunQuery = () => {
    if (!activeSourceId || !currentQuery) return;

    const now = Date.now();
    let start: number;
    let end: number = now;

    if (timeRange.type === "custom") {
      start = timeRange.start;
      end = timeRange.end;
    } else {
      const durationMap: Record<string, number> = {
        "5m": 5 * 60_000,
        "15m": 15 * 60_000,
        "30m": 30 * 60_000,
        "1h": 60 * 60_000,
        "3h": 3 * 60 * 60_000,
        "6h": 6 * 60 * 60_000,
        "12h": 12 * 60 * 60_000,
        "24h": 24 * 60 * 60_000,
      };
      const duration = durationMap[timeRange.value] ?? 5 * 60_000;
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

  if (!activeSource) {
    return (
      <EmptyState
        title="未选择数据源"
        description="请先在左侧添加并选择一个 Loki 数据源"
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-border bg-bg-secondary">
        <div className="p-3 space-y-2">
          <QueryInput onRun={handleRunQuery} />
          <div className="flex items-center gap-2">
            <TimeRangePicker />
            <button
              onClick={toggleWrapLines}
              className={`toolbar-btn ${wrapLines ? "text-accent bg-accent/10" : ""}`}
              title={wrapLines ? "当前: 自动换行" : "当前: 不换行"}
            >
              <WrapText size={14} />
            </button>
            <button
              onClick={toggleTimestamp}
              className={`toolbar-btn ${!showTimestamp ? "text-accent bg-accent/10" : ""}`}
              title={showTimestamp ? "隐藏时间列" : "显示时间列"}
            >
              {showTimestamp ? <Clock size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              onClick={toggleTheme}
              className="toolbar-btn"
              title={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <div className="flex-1" />

            {/* Query history — anchored from right side */}
            <div className="relative" ref={historyRef}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="toolbar-btn"
                title="历史查询"
              >
                <Clock size={14} />
                <span className="text-[10px]">{savedQueries.length}</span>
              </button>
              {showHistory && savedQueries.length > 0 && (
                <div className="absolute top-full right-0 mt-1 bg-bg-elevated border border-border rounded-lg shadow-xl z-30 py-1 min-w-[320px] max-h-64 overflow-y-auto"
                  style={{ right: 0 }}
                >
                  <div className="px-3 py-1 text-[10px] text-text-muted uppercase tracking-wider">历史查询</div>
                  {savedQueries.map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        applySavedQuery(entry);
                        setShowHistory(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-bg-tertiary transition-colors border-b border-border/30 last:border-0"
                    >
                      <div className="text-xs font-mono text-text-primary truncate">{entry.query}</div>
                      <div className="text-[10px] text-text-muted mt-0.5 flex items-center gap-2">
                        <span>{entry.timeRange.type === "preset" ? entry.timeRange.value : "自定义"}</span>
                        {entry.queryTime != null && <span>{entry.queryTime}ms</span>}
                        <span>·</span>
                        <span>{new Date(entry.timestamp).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showHistory && savedQueries.length === 0 && (
                <div className="absolute top-full right-0 mt-1 bg-bg-elevated border border-border rounded-lg shadow-xl z-30 py-3 px-3 min-w-[180px]">
                  <div className="text-xs text-text-muted text-center">暂无历史查询</div>
                </div>
              )}
            </div>

            {/* Cancel button — shown while query is running */}
            {isRunning && (
              <button
                onClick={cancelQuery}
                className="toolbar-btn text-log-error hover:bg-log-error/10"
                title="取消查询"
              >
                <Square size={12} />
                取消
              </button>
            )}

            {/* Run query button */}
            <button
              onClick={handleRunQuery}
              disabled={isLoading || !currentQuery}
              className="toolbar-btn-primary"
            >
              {isLoading ? "查询中..." : "查询"}
            </button>
          </div>
        </div>
        {/* Results info bar */}
        <div className="flex items-center gap-3 px-3 py-1.5 text-[11px] text-text-muted border-t border-border">
          <span>
            {totalEntries > 0 ? `${totalEntries} 条结果` : "无日志"}
            {queryTime !== null && ` (${queryTime}ms)`}
          </span>
          {isLoading && (
            <span className="text-warning flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
              查询中...
            </span>
          )}
          {error && <span className="text-log-error">错误: {error}</span>}
        </div>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-hidden">
        <LogList wrapLines={wrapLines} />
      </div>
    </div>
  );
}
