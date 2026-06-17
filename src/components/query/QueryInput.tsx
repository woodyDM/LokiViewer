import { useRef, useEffect, useState } from "react";
import { useQueryStore } from "../../stores/queryStore";
import { History, X } from "lucide-react";

interface QueryInputProps {
  onRun: () => void;
}

export function QueryInput({ onRun }: QueryInputProps) {
  const currentQuery = useQueryStore((s) => s.currentQuery);
  const setQuery = useQueryStore((s) => s.setQuery);
  const queryHistory = useQueryStore((s) => s.queryHistory);
  const addToHistory = useQueryStore((s) => s.addToHistory);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Auto-resize
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }, [currentQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addToHistory(currentQuery);
      onRun();
    }
    if (e.key === "ArrowUp" && historyIdx < queryHistory.length - 1) {
      e.preventDefault();
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setQuery(queryHistory[queryHistory.length - 1 - newIdx] || "");
    }
    if (e.key === "ArrowDown" && historyIdx >= 0) {
      e.preventDefault();
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      if (newIdx < 0) {
        setQuery("");
      } else {
        setQuery(queryHistory[queryHistory.length - 1 - newIdx] || "");
      }
    }
  };

  return (
    <div className="relative flex items-start gap-1">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={currentQuery}
          onChange={(e) => {
            setQuery(e.target.value);
            setHistoryIdx(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          placeholder='输入 LogQL 查询，例如: {app="my-app"} |= "error"'
          className="w-full font-mono text-log-base bg-bg-primary border border-border rounded px-3 py-1.5 resize-none overflow-hidden placeholder:text-text-muted/60"
          rows={1}
        />
        {currentQuery && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
          >
            <X size={14} />
          </button>
        )}

        {/* History dropdown */}
        {showHistory && queryHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border rounded shadow-lg z-10 max-h-48 overflow-y-auto">
            {[...queryHistory].reverse().slice(0, 10).map((q, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-1.5 text-xs font-mono text-text-secondary hover:bg-bg-tertiary hover:text-text-primary truncate"
                onMouseDown={() => {
                  setQuery(q);
                  setHistoryIdx(-1);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowHistory(!showHistory)}
        className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
        title="查询历史"
      >
        <History size={14} />
      </button>
    </div>
  );
}
