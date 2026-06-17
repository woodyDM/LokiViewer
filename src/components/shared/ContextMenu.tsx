import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, Math.max(0, window.innerWidth - 200));
  const adjustedY = Math.min(y, Math.max(0, window.innerHeight - 100));

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-bg-elevated border border-border rounded-lg shadow-xl py-1 min-w-[150px]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-tertiary flex items-center gap-2 transition-colors"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
