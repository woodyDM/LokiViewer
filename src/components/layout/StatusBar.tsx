import { useEffect, useState } from "react";
import { useSourcesStore } from "../../stores/sourcesStore";
import { useLogsStore } from "../../stores/logsStore";
import { getVersion } from "@tauri-apps/api/app";

export function StatusBar() {
  const [version, setVersion] = useState("");
  const sources = useSourcesStore((s) => s.sources);
  const activeSourceId = useSourcesStore((s) => s.activeSourceId);
  const activeSource = sources.find((s) => s.id === activeSourceId);
  const totalEntries = useLogsStore((s) => s.totalEntries);
  const isLoading = useLogsStore((s) => s.isLoading);

  useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion("0.1.0"));
  }, []);

  return (
    <div className="h-7 flex items-center gap-3 px-3 text-[11px] text-text-muted bg-bg-secondary border-t border-border flex-shrink-0">
      {activeSource ? (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${isLoading ? "bg-warning animate-pulse" : "bg-success"}`}
          />
          <span className="font-medium text-text-secondary">
            {activeSource.name}
          </span>
        </div>
      ) : (
        <span className="text-text-muted">未选择数据源</span>
      )}

      <span className="text-border">|</span>
      <span>
        {totalEntries > 0 ? `${totalEntries} 条日志` : "无日志"}
      </span>
      <div className="flex-1" />
      {version && <span className="text-text-muted">v{version}</span>}
    </div>
  );
}
