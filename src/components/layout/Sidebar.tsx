import { SourceList } from "../sources/SourceList";
import { LabelTree } from "../labels/LabelTree";

export function Sidebar() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sources section */}
      <div className="sidebar-panel border-b border-border" style={{ maxHeight: "40%" }}>
        <div className="sidebar-panel-header">
          <span>数据源</span>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <SourceList />
        </div>
      </div>

      {/* Labels section */}
      <div className="sidebar-panel flex-1 overflow-hidden">
        <div className="sidebar-panel-header">
          <span>标签</span>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <LabelTree />
        </div>
      </div>
    </div>
  );
}
