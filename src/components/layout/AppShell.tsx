import { useUIStore } from "../../stores/uiStore";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { MainPanel } from "./MainPanel";
import { useEffect, useRef, useCallback } from "react";
import { useSourcesStore } from "../../stores/sourcesStore";
import { useQueryStore } from "../../stores/queryStore";

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth);
  const loadPrefs = useUIStore((s) => s.loadPrefs);
  const loadSources = useSourcesStore((s) => s.loadSources);
  const loadPersistedQuery = useQueryStore((s) => s.loadPersistedQuery);
  const loadSavedQueries = useQueryStore((s) => s.loadSavedQueries);
  const dragging = useRef(false);

  useEffect(() => {
    loadPrefs();
    loadSources();
    loadPersistedQuery();
    loadSavedQueries();
  }, [loadPrefs, loadSources, loadPersistedQuery, loadSavedQueries]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setSidebarWidth(e.clientX);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [setSidebarWidth]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <>
            <div
              className="border-r border-border bg-bg-secondary flex-shrink-0 overflow-hidden"
              style={{ width: sidebarWidth }}
            >
              <Sidebar />
            </div>
            {/* Drag handle */}
            <div
              onMouseDown={handleMouseDown}
              className="w-1 cursor-col-resize hover:bg-accent/50 active:bg-accent transition-colors flex-shrink-0"
            />
          </>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">
          <MainPanel />
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
