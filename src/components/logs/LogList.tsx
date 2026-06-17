import { useRef, useMemo, useEffect, useState, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLogsStore } from "../../stores/logsStore";
import { LogRow } from "./LogRow";
import { LogDetail } from "./LogDetail";
import { Spinner } from "../shared/Spinner";
import { EmptyState } from "../shared/EmptyState";
import { ErrorState } from "../shared/ErrorState";

/** Constrains the detail panel to the visible width of the scroll container. */
function DetailWrapper({
  scrollRef,
  children,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.clientWidth > 0) setWidth(el.clientWidth);
  }, []);
  return <div style={{ width: width > 0 ? width : undefined, overflow: "hidden" }}>{children}</div>;
}

interface LogListProps {
  wrapLines?: boolean;
}

export function LogList({ wrapLines = false }: LogListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    flatEntries,
    isLoading,
    error,
    hasMore,
    expandedRows,
    toggleRowExpanded,
  } = useLogsStore();

  // Estimate minimum table width.
  // When wrap is ON → just viewport width so text wraps.
  // When wrap is OFF → wide enough to fit longest line so horizontal scrollbar appears.
  const minListWidth = useMemo(() => {
    if (wrapLines) return 0; // no forced width, let viewport decide
    let maxLen = 0;
    for (const e of flatEntries) {
      maxLen = Math.max(maxLen, e.line.length);
    }
    // monospace 13px ≈ 7.8px/char + timestamp(144) + level(56) + app(140) + expand(16) + padding(32)
    return Math.max(800, maxLen * 7.8 + 390);
  }, [flatEntries, wrapLines]);

  const virtualizer = useVirtualizer({
    count: flatEntries.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 15,
  });

  if (error) {
    return <ErrorState title="查询错误" message={error} />;
  }

  if (!isLoading && flatEntries.length === 0) {
    return (
      <EmptyState
        title="无日志结果"
        description="尝试调整查询语句或时间范围"
      />
    );
  }

  return (
    <div className="h-full relative">
      <div ref={scrollRef} className="h-full overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            minWidth: `${minListWidth}px`,
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const entry = flatEntries[virtualItem.index];
            if (!entry) return null;
            const isExpanded = expandedRows.has(entry.key);

            return (
              <div
                key={entry.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <LogRow
                  entry={entry}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleRowExpanded(entry.key)}
                  wrapLine={wrapLines}
                />
                {isExpanded && (
                  <DetailWrapper scrollRef={scrollRef}>
                    <LogDetail entry={entry} />
                  </DetailWrapper>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg-elevated/80 text-xs text-text-secondary">
            <Spinner size={14} />
            查询中...
          </div>
        </div>
      )}

      {hasMore && !isLoading && flatEntries.length > 0 && (
        <div className="flex justify-center py-2 border-t border-border">
          <button
            onClick={() => {}}
            className="px-4 py-1 text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
