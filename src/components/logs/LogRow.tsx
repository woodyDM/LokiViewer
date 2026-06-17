import { ChevronRight, ChevronDown, Search, Copy } from "lucide-react";
import { useState, useRef } from "react";
import type { FlatLogEntry } from "../../types/query";
import { LOG_LEVEL_COLORS, stringToColor, shortenAppLabel } from "../../lib/constants";
import { useQueryStore } from "../../stores/queryStore";
import { useUIStore } from "../../stores/uiStore";
import { ContextMenu } from "../shared/ContextMenu";

interface LogRowProps {
  entry: FlatLogEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  wrapLine?: boolean;
}

export function LogRow({ entry, isExpanded, onToggleExpand, wrapLine = false }: LogRowProps) {
  const levelColor = LOG_LEVEL_COLORS[entry.logLevel] ?? "text-text-muted";
  const appValue = shortenAppLabel(entry.labels["app"] ?? entry.labels["application"] ?? "");
  const showTimestamp = useUIStore((s) => s.showTimestamp);
  const setQuery = useQueryStore((s) => s.setQuery);
  const currentQuery = useQueryStore((s) => s.currentQuery);
  const selectedTextRef = useRef("");
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; selectedText: string } | null>(null);

  const handleMouseUp = () => {
    const sel = document.getSelection();
    selectedTextRef.current = sel?.toString().trim() || "";
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = selectedTextRef.current;
    if (!text) return;
    setCtxMenu({ x: e.clientX, y: e.clientY, selectedText: text });
  };

  const handleAddToQuery = () => {
    if (!ctxMenu) return;
    const escaped = ctxMenu.selectedText.replace(/"/g, '\\"');
    setQuery(currentQuery + ` |= "${escaped}"`);
  };

  const handleCopyText = async () => {
    if (!ctxMenu) return;
    try {
      await navigator.clipboard.writeText(ctxMenu.selectedText);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div
        onClick={onToggleExpand}
        onContextMenu={handleContextMenu}
        className="flex items-start border-b border-border/30 hover:bg-bg-tertiary/50 cursor-pointer transition-colors group"
      >
        {/* Expand indicator */}
        <div className="flex-shrink-0 w-4 h-7 flex items-center justify-center">
          {isExpanded ? (
            <ChevronDown size={12} className="text-text-muted" />
          ) : (
            <ChevronRight size={12} className="text-text-muted opacity-0 group-hover:opacity-100" />
          )}
        </div>

        {/* App label column — first, fixed w-24, centered */}
        <span
          className="flex-shrink-0 w-24 inline-flex items-center justify-center px-1 py-0.5 mx-0.5 rounded text-[10px] font-mono leading-4 select-text mt-0.5 text-center"
          style={{ backgroundColor: appValue ? stringToColor(appValue) : "transparent", color: appValue ? "#fff" : "transparent" }}
          title={appValue}
        >
          <span className={`truncate w-full ${appValue ? "" : "invisible"}`}>{appValue || "-"}</span>
        </span>

        {/* Timestamp — hideable */}
        {showTimestamp && (
          <span className="flex-shrink-0 w-36 text-[11px] text-text-muted font-mono leading-7 select-text">
            {entry.timestamp}
          </span>
        )}

        {/* Log level */}
        <span
          className={`flex-shrink-0 w-14 text-[10px] font-semibold uppercase tracking-wider leading-7 select-text ${levelColor}`}
        >
          {entry.logLevel}
        </span>

        {/* Message line */}
        <div
          className={`flex-1 min-w-0 font-mono text-log-base text-text-primary leading-7 select-text ${
            wrapLine ? "whitespace-pre-wrap break-all" : "whitespace-nowrap"
          }`}
          onMouseUp={handleMouseUp}
        >
          {entry.line}
        </div>
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={[
            {
              label: "复制",
              icon: <Copy size={12} />,
              onClick: handleCopyText,
            },
            {
              label: "添加到查询",
              icon: <Search size={12} />,
              onClick: handleAddToQuery,
            },
          ]}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  );
}
