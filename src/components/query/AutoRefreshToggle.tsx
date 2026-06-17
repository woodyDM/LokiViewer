import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryStore } from "../../stores/queryStore";
import { REFRESH_INTERVALS } from "../../lib/constants";

export function AutoRefreshToggle() {
  const refreshInterval = useQueryStore((s) => s.refreshInterval);
  const isAutoRefreshing = useQueryStore((s) => s.isAutoRefreshing);
  const setRefreshInterval = useQueryStore((s) => s.setRefreshInterval);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentLabel =
    REFRESH_INTERVALS.find((i) => i.value === refreshInterval)?.label || "关闭";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors ${
          isAutoRefreshing
            ? "bg-accent/20 text-accent"
            : "text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
        }`}
      >
        <RefreshCw
          size={12}
          className={isAutoRefreshing ? "animate-spin" : ""}
        />
        {isAutoRefreshing ? `⟳ ${currentLabel}` : "自动刷新"}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-bg-elevated border border-border rounded-lg shadow-xl z-20 py-1 min-w-[100px]">
          {REFRESH_INTERVALS.map((item) => (
            <button
              key={String(item.value)}
              onClick={() => {
                setRefreshInterval(item.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                refreshInterval === item.value
                  ? "text-accent bg-accent/10"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
