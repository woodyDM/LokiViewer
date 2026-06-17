export interface LokiSource {
  id: string;
  name: string;
  url: string;
  tenant_id: string | null;
  auth: AuthConfig | null;
  is_active: boolean;
}

export interface AuthConfig {
  username: string;
  password: string;
}

export interface QueryRequest {
  source_id: string;
  query: string;
  start: number;
  end: number;
  limit: number;
  direction: "forward" | "backward";
}

export interface LabelsRequest {
  source_id: string;
  start: number | null;
  end: number | null;
}

export interface QueryResult {
  status: string;
  data: QueryResponseData;
}

export interface QueryResponseData {
  result_type: string;
  result: Stream[];
  stats: QueryStats | null;
}

export interface Stream {
  stream: Record<string, string>;
  values: [string, string][];
}

export interface QueryStats {
  summary: StatsSummary | null;
}

export interface StatsSummary {
  bytesProcessedPerSecond: number;
  linesProcessedPerSecond: number;
  totalBytesProcessed: number;
  totalLinesProcessed: number;
  execTime: number;
  queueTime: number;
  subqueries: number;
  totalEntriesReturned: number;
}

export interface LabelKey {
  name: string;
  values: string[];
  values_loaded: boolean;
}

export interface LabelResponse {
  status: string;
  data: string[];
}

export interface LabelValuesResponse {
  status: string;
  data: string[];
}

export interface CommandError {
  kind: string;
  message: string;
}
