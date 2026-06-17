import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { FlatLogEntry } from "../../types/query";
import { stringToColor, shortenAppLabel } from "../../lib/constants";
import { useUIStore } from "../../stores/uiStore";

interface LogDetailProps {
  entry: FlatLogEntry;
}

export function LogDetail({ entry }: LogDetailProps) {
  const [copied, setCopied] = useState(false);
  const showTimestamp = useUIStore((s) => s.showTimestamp);
  const appValue = shortenAppLabel(entry.labels["app"] ?? entry.labels["application"] ?? "");

  const handleCopy = async () => {
    try {
      const detail = JSON.stringify(
        { timestamp: entry.timestamp, timestamp_nano: entry.timestampNano, level: entry.logLevel, message: entry.line, labels: entry.labels },
        null,
        2,
      );
      await navigator.clipboard.writeText(detail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-bg-secondary border-b border-border py-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 mb-2">
        <span className="text-xs font-semibold text-text-primary">详情</span>
        <button onClick={handleCopy} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>

      {/* Aligned columns: same layout as LogRow */}
      <div className="flex items-start">
        {/* Expand spacer (w-4) */}
        <div className="flex-shrink-0 w-4" />

        {/* App label — fixed width, centered */}
        <span
          className="flex-shrink-0 w-24 inline-flex items-center justify-center px-1 py-0.5 mx-0.5 rounded text-[10px] font-mono leading-4 mt-0.5 text-center"
          style={{ backgroundColor: appValue ? stringToColor(appValue) : "transparent", color: appValue ? "#fff" : "transparent" }}
        >
          <span className="truncate w-full">{appValue || "-"}</span>
        </span>

        {/* Timestamp spacer */}
        {showTimestamp && <div className="flex-shrink-0 w-36" />}

        {/* Level spacer */}
        <div className="flex-shrink-0 w-14" />

        {/* Message — fills the rest, aligned with row message column */}
        <div className="flex-1 min-w-0 pr-6">
          <pre className="font-mono text-xs text-text-primary bg-bg-primary rounded p-2 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
            {entry.line}
          </pre>
        </div>
      </div>

      {/* Labels + metadata */}
      <div className="px-6 mt-3">
        <div className="text-[10px] text-text-muted mb-0.5 uppercase tracking-wider">标签</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(entry.labels).map(([key, value]) => (
            <span key={key} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-bg-tertiary text-[10px] font-mono">
              <span className="text-text-muted">{key}=</span>
              <span className="text-accent">&quot;{value}&quot;</span>
            </span>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-text-muted">
          Timestamp (ns): {entry.timestampNano}
        </div>
      </div>
    </div>
  );
}
