import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import { useLabelsStore } from "../../stores/labelsStore";
import { useSourcesStore } from "../../stores/sourcesStore";
import { useQueryStore } from "../../stores/queryStore";
import { LabelItem } from "./LabelItem";
import { Spinner } from "../shared/Spinner";
import { EmptyState } from "../shared/EmptyState";

export function LabelTree() {
  const {
    labels,
    isLoading,
    searchFilter,
    setSearchFilter,
    fetchLabels,
    fetchLabelValues,
    clearLabels,
  } = useLabelsStore();
  const activeSourceId = useSourcesStore((s) => s.activeSourceId);
  const timeRange = useQueryStore((s) => s.timeRange);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!activeSourceId) {
      clearLabels();
      return;
    }
    let start: number | undefined;
    let end: number | undefined;
    if (timeRange.type === "custom") {
      start = timeRange.start * 1_000_000;
      end = timeRange.end * 1_000_000;
    }
    fetchLabels(activeSourceId, start, end);
  }, [activeSourceId, timeRange, fetchLabels, clearLabels]);

  const handleRefresh = useCallback(() => {
    if (!activeSourceId) return;
    let start: number | undefined;
    let end: number | undefined;
    if (timeRange.type === "custom") {
      start = timeRange.start * 1_000_000;
      end = timeRange.end * 1_000_000;
    }
    fetchLabels(activeSourceId, start, end);
  }, [activeSourceId, timeRange, fetchLabels]);

  // Debounce search filter
  useEffect(() => {
    const timer = setTimeout(() => setSearchFilter(search), 300);
    return () => clearTimeout(timer);
  }, [search, setSearchFilter]);

  const filtered = labels.filter((l) =>
    l.name.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  // Priority labels: namespace, level, app at top
  const LABEL_PRIORITY = ["namespace", "level", "app"];
  const sorted = [...filtered].sort((a, b) => {
    const ai = LABEL_PRIORITY.indexOf(a.name);
    const bi = LABEL_PRIORITY.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  if (!activeSourceId) {
    return (
      <EmptyState
        title="未选择数据源"
        description="请先选择一个数据源"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-2 py-1.5">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="筛选标签..."
            className="w-full pl-6 pr-2 py-1 text-[11px] bg-bg-primary border border-border rounded"
          />
        </div>
      </div>

      {/* Refresh */}
      <div className="px-2 pb-1 flex justify-end">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-[10px] text-text-muted hover:text-text-primary transition-colors"
        >
          <RefreshCw size={10} />
          刷新标签
        </button>
      </div>

      {/* Label list */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {sorted.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted">
            {searchFilter ? "无匹配标签" : "暂无标签"}
          </div>
        ) : (
          sorted.map((label) => (
            <LabelItem
              key={label.name}
              label={label}
              onExpand={(name) => {
                let start: number | undefined;
                let end: number | undefined;
                if (timeRange.type === "custom") {
                  start = timeRange.start * 1_000_000;
                  end = timeRange.end * 1_000_000;
                }
                fetchLabelValues(activeSourceId, name, start, end);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
