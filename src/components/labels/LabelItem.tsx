import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { LabelKey } from "../../types/loki";
import { useLabelsStore } from "../../stores/labelsStore";
import { LabelValueChip } from "./LabelValueChip";
import { Spinner } from "../shared/Spinner";

interface LabelItemProps {
  label: LabelKey;
  onExpand: (name: string) => void;
}

export function LabelItem({ label, onExpand }: LabelItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isValuesLoading = useLabelsStore((s) => s.isValuesLoading);

  const handleToggle = () => {
    if (!expanded && !label.values_loaded) {
      onExpand(label.name);
    }
    setExpanded(!expanded);
  };

  const loading = isValuesLoading.has(label.name);

  return (
    <div className="mb-0.5">
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-1 px-2 py-1 rounded text-xs text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-left"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="font-mono text-[11px]">{label.name}</span>
        {label.values_loaded && (
          <span className="text-[10px] text-text-muted ml-auto">
            {label.values.length}
          </span>
        )}
      </button>

      {expanded && (
        <div className="pl-5 pr-2 pb-1">
          {loading ? (
            <div className="flex items-center gap-1.5 py-1">
              <Spinner size={12} />
              <span className="text-[10px] text-text-muted">加载中...</span>
            </div>
          ) : label.values_loaded && label.values.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {label.values.map((value) => (
                <LabelValueChip
                  key={value}
                  labelName={label.name}
                  labelValue={value}
                />
              ))}
            </div>
          ) : label.values_loaded ? (
            <span className="text-[10px] text-text-muted">无值</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
