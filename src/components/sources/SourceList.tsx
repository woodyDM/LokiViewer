import { useState } from "react";
import { Plus } from "lucide-react";
import { useSourcesStore } from "../../stores/sourcesStore";
import { SourceCard } from "./SourceCard";
import { SourceForm } from "./SourceForm";
import { Spinner } from "../shared/Spinner";
import { EmptyState } from "../shared/EmptyState";

export function SourceList() {
  const { sources, isLoading, activeSourceId, setActiveSource, deleteSource } =
    useSourcesStore();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size={20} />
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <>
        <EmptyState
          title="暂无数据源"
          description="添加一个 Loki 数据源开始查询日志"
          action={{ label: "添加数据源", onClick: () => setShowForm(true) }}
        />
        <SourceForm open={showForm} onClose={() => setShowForm(false)} />
      </>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {sources.map((source) => (
        <SourceCard
          key={source.id}
          source={source}
          isActive={source.id === activeSourceId}
          onSelect={() => setActiveSource(source.id)}
          onDelete={() => deleteSource(source.id)}
        />
      ))}

      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
      >
        <Plus size={14} />
        添加数据源
      </button>

      <SourceForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
