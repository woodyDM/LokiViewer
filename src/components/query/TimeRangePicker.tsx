import { useState } from "react";
import { Clock } from "lucide-react";
import { useQueryStore } from "../../stores/queryStore";
import { TIME_PRESETS } from "../../lib/constants";
export function TimeRangePicker() {
  const timeRange = useQueryStore((s) => s.timeRange);
  const setTimeRange = useQueryStore((s) => s.setTimeRange);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handlePreset = (value: string) => {
    setTimeRange({ type: "preset", value: value as any });
  };


  const handleCustomApply = () => {
    if (customStart && customEnd) {
      setTimeRange({
        type: "custom",
        start: new Date(customStart).getTime(),
        end: new Date(customEnd).getTime(),
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {TIME_PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => handlePreset(p.value)}
          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
            timeRange.type === "preset" && timeRange.value === p.value
              ? "bg-accent/20 text-accent"
              : "text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
          }`}
        >
          {p.label}
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-2 py-1 text-[11px] font-medium rounded flex items-center gap-1 transition-colors ${
            timeRange.type === "custom"
              ? "bg-accent/20 text-accent"
              : "text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
          }`}
        >
          <Clock size={12} />
          自定义
        </button>

        {showCustom && (
          <div className="absolute top-full right-0 mt-1 bg-bg-elevated border border-border rounded-lg shadow-xl z-20 p-3 w-72">
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-text-muted mb-0.5">开始时间</label>
                <input
                  type="datetime-local"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-0.5">结束时间</label>
                <input
                  type="datetime-local"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
                className="w-full px-2 py-1 text-xs font-medium rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-40"
              >
                应用
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
