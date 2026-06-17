import { invoke } from "@tauri-apps/api/core";
import type {
  LokiSource,
  QueryRequest,
  QueryResult,
  LabelKey,
} from "../types/loki";

// --- Sources ---

export async function listSources(): Promise<LokiSource[]> {
  return invoke("list_sources");
}

export async function addSource(
  name: string,
  url: string,
  tenantId?: string,
  username?: string,
  password?: string,
): Promise<LokiSource> {
  return invoke("add_source", { name, url, tenantId, username, password });
}

export async function updateSource(source: LokiSource): Promise<void> {
  return invoke("update_source", { source });
}

export async function deleteSource(sourceId: string): Promise<void> {
  return invoke("delete_source", { sourceId });
}

export async function setActiveSource(sourceId: string): Promise<void> {
  return invoke("set_active_source", { sourceId });
}

export async function testConnection(
  source: LokiSource,
): Promise<boolean> {
  return invoke("test_connection", { source });
}

// --- Query ---

export async function executeQuery(
  request: QueryRequest,
): Promise<QueryResult> {
  return invoke("execute_query", { request });
}

// --- Labels ---

export async function queryLabels(
  sourceId: string,
  start?: number,
  end?: number,
): Promise<LabelKey[]> {
  return invoke("query_labels", {
    request: { source_id: sourceId, start, end },
  });
}

export async function queryLabelValues(
  sourceId: string,
  labelName: string,
  start?: number,
  end?: number,
): Promise<string[]> {
  return invoke("query_label_values", {
    sourceId,
    labelName,
    start,
    end,
  });
}

// --- Cancel ---

export async function cancelQuery(): Promise<void> {
  return invoke("cancel_query");
}

// --- Last Query Persistence ---

export async function saveLastQuery(query: string): Promise<void> {
  return invoke("save_last_query", { query });
}

export async function loadLastQuery(): Promise<string> {
  return invoke("load_last_query");
}

// --- Preferences ---

export async function savePrefs(json: string): Promise<void> {
  return invoke("save_prefs", { json });
}

export async function loadPrefs(): Promise<string> {
  return invoke("load_prefs");
}

// --- Query History ---

export async function saveQueryHistory(json: string): Promise<void> {
  return invoke("save_query_history", { json });
}

export async function loadQueryHistory(): Promise<string> {
  return invoke("load_query_history");
}

// --- Health ---

export async function checkSourceHealth(
  sourceId: string,
): Promise<boolean> {
  return invoke("check_source_health", { sourceId });
}
