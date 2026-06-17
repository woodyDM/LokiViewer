import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <SearchX size={40} className="text-text-muted mb-3" />
      <h3 className="text-sm font-medium text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-text-muted max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 px-3 py-1.5 text-xs font-medium rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
