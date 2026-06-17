import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Error",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertTriangle size={36} className="text-log-error mb-3" />
      <h3 className="text-sm font-medium text-log-error mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-md mb-3 break-words">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}
