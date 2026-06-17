use std::collections::HashMap;
use serde::{Deserialize, Serialize};

// === Auth ===

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthConfig {
    pub username: String,
    #[serde(skip_serializing)]
    pub password: String,
}

// === Loki Source ===

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LokiSource {
    pub id: String,
    pub name: String,
    pub url: String,
    pub tenant_id: Option<String>,
    pub auth: Option<AuthConfig>,
    pub is_active: bool,
}

// === Request types ===

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryRequest {
    pub source_id: String,
    pub query: String,
    pub start: i64,
    pub end: i64,
    pub limit: u32,
    pub direction: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LabelsRequest {
    pub source_id: String,
    pub start: Option<i64>,
    pub end: Option<i64>,
}

// === Response types ===

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResult {
    pub status: String,
    pub data: QueryResponseData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryResponseData {
    pub result_type: String,
    pub result: Vec<Stream>,
    pub stats: Option<QueryStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stream {
    pub stream: HashMap<String, String>,
    pub values: Vec<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryStats {
    pub summary: Option<StatsSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsSummary {
    #[serde(rename = "bytesProcessedPerSecond")]
    pub bytes_processed_per_second: f64,
    #[serde(rename = "linesProcessedPerSecond")]
    pub lines_processed_per_second: f64,
    #[serde(rename = "totalBytesProcessed")]
    pub total_bytes_processed: f64,
    #[serde(rename = "totalLinesProcessed")]
    pub total_lines_processed: f64,
    #[serde(rename = "execTime")]
    pub exec_time: f64,
    #[serde(rename = "queueTime")]
    pub queue_time: f64,
    #[serde(rename = "subqueries")]
    pub subqueries: f64,
    #[serde(rename = "totalEntriesReturned")]
    pub total_entries_returned: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LabelKey {
    pub name: String,
    pub values: Vec<String>,
    pub values_loaded: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LabelResponse {
    pub status: String,
    pub data: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LabelValuesResponse {
    pub status: String,
    pub data: Vec<String>,
}
