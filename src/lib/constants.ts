export const REFRESH_INTERVALS = [
  { label: "关闭", value: null },
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
  { label: "1m", value: 60_000 },
  { label: "5m", value: 300_000 },
] as const;

export const TIME_PRESETS = [
  { label: "5m", value: "5m" as const },
  { label: "15m", value: "15m" as const },
  { label: "30m", value: "30m" as const },
  { label: "1h", value: "1h" as const },
  { label: "3h", value: "3h" as const },
  { label: "6h", value: "6h" as const },
  { label: "12h", value: "12h" as const },
  { label: "24h", value: "24h" as const },
];

export const DEFAULT_LIMIT = 1000;

/** Shorten app labels: "carelink-xxx" → "cl-xxx" */
export function shortenAppLabel(val: string): string {
  if (val.startsWith("carelink-")) return "cl-" + val.slice(9);
  return val;
}

/** Deterministic color from a string (for app label badges). */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

export const LOG_LEVEL_COLORS: Record<string, string> = {
  debug: "text-log-debug",
  info: "text-log-info",
  warn: "text-log-warn",
  error: "text-log-error",
  fatal: "text-log-fatal",
  unknown: "text-text-muted",
};
