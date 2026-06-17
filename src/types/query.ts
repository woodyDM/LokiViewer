export type TimePreset = "5m" | "15m" | "30m" | "1h" | "3h" | "6h" | "12h" | "24h";

export type TimeRange =
  | { type: "preset"; value: TimePreset }
  | { type: "custom"; start: number; end: number };

export interface FlatLogEntry {
  key: string;
  timestamp: string;
  timestampNano: number;
  line: string;
  labels: Record<string, string>;
  logLevel: LogLevel;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "unknown";
