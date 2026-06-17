use crate::commands::cancel::QueryControl;
use crate::config::store::ConfigStore;
use crate::loki::client::LokiClient;
use crate::loki::error::CommandError;
use crate::loki::types::{LabelKey, LabelsRequest, QueryRequest, QueryResult};
use tauri::AppHandle;

#[tauri::command]
pub async fn execute_query(
    app: AppHandle,
    client: tauri::State<'_, LokiClient>,
    store: tauri::State<'_, ConfigStore>,
    control: tauri::State<'_, QueryControl>,
    request: QueryRequest,
) -> Result<QueryResult, CommandError> {
    let sources = store.load_sources(&app);
    let source = sources
        .iter()
        .find(|s| s.id == request.source_id)
        .ok_or_else(|| CommandError {
            kind: "source_not_found".to_string(),
            message: format!("Source not found: {}", request.source_id),
        })?;

    let mut cancel_rx = control.register();
    let query_fut = client.query_range(source, &request);
    tokio::pin!(query_fut);

    tokio::select! {
        result = &mut query_fut => {
            result.map_err(Into::into)
        }
        _ = &mut cancel_rx => {
            Err(CommandError {
                kind: "cancelled".to_string(),
                message: "查询已取消".to_string(),
            })
        }
    }
}

#[tauri::command]
pub async fn query_labels(
    app: AppHandle,
    client: tauri::State<'_, LokiClient>,
    store: tauri::State<'_, ConfigStore>,
    request: LabelsRequest,
) -> Result<Vec<LabelKey>, CommandError> {
    let sources = store.load_sources(&app);
    let source = sources
        .iter()
        .find(|s| s.id == request.source_id)
        .ok_or_else(|| CommandError {
            kind: "source_not_found".to_string(),
            message: format!("Source not found: {}", request.source_id),
        })?;

    let label_names = client.labels(source, &request).await?;
    let keys: Vec<LabelKey> = label_names
        .into_iter()
        .map(|name| LabelKey {
            name,
            values: vec![],
            values_loaded: false,
        })
        .collect();

    Ok(keys)
}

#[tauri::command]
pub async fn query_label_values(
    app: AppHandle,
    client: tauri::State<'_, LokiClient>,
    store: tauri::State<'_, ConfigStore>,
    source_id: String,
    label_name: String,
    start: Option<i64>,
    end: Option<i64>,
) -> Result<Vec<String>, CommandError> {
    let sources = store.load_sources(&app);
    let source = sources.iter().find(|s| s.id == source_id).ok_or_else(|| {
        CommandError {
            kind: "source_not_found".to_string(),
            message: format!("Source not found: {}", source_id),
        }
    })?;

    let params = LabelsRequest { source_id, start, end };
    let values = client.label_values(source, &label_name, &params).await?;
    Ok(values)
}
