import { useState } from "react";
import { Trash2, Wifi, WifiOff } from "lucide-react";
import type { LokiSource } from "../../types/loki";
import { useSourcesStore } from "../../stores/sourcesStore";

interface SourceCardProps {
  source: LokiSource;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function SourceCard({ source, isActive, onSelect, onDelete }: SourceCardProps) {
  const [testing, setTesting] = useState(false);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const testConnection = useSourcesStore((s) => s.testConnection);

  const handleTest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setTesting(true);
    try {
      const ok = await testConnection(source);
      setHealthy(ok);
    } catch {
      setHealthy(false);
    }
    setTesting(false);
    setTimeout(() => setHealthy(null), 3000);
  };

  return (
    <div
      onClick={onSelect}
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs
        transition-colors duration-150
        ${isActive
          ? "bg-accent-muted text-accent border border-accent/30"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border border-transparent"
        }
      `}
    >
      <button
        onClick={handleTest}
        className="flex-shrink-0 p-0.5 rounded hover:bg-bg-elevated transition-colors"
        title="测试连接"
      >
        {healthy === null ? (
          testing ? (
            <span className="w-3 h-3 rounded-full border border-current animate-pulse block" />
          ) : (
            <Wifi size={12} />
          )
        ) : healthy ? (
          <Wifi size={12} className="text-success" />
        ) : (
          <WifiOff size={12} className="text-log-error" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{source.name}</div>
        <div className="truncate text-[10px] text-text-muted">{source.url}</div>
      </div>

      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-shrink-0 p-0.5 rounded text-text-muted hover:text-log-error hover:bg-bg-elevated transition-colors"
          title="删除"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
