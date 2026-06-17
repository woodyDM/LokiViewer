use crate::config::store::ConfigStore;
use crate::loki::client::LokiClient;
use crate::loki::error::CommandError;

#[tauri::command]
pub async fn check_source_health(
    app: tauri::AppHandle,
    client: tauri::State<'_, LokiClient>,
    store: tauri::State<'_, ConfigStore>,
    source_id: String,
) -> Result<bool, CommandError> {
    let sources = store.load_sources(&app);
    let source = sources.iter().find(|s| s.id == source_id).ok_or_else(|| {
        CommandError {
            kind: "source_not_found".to_string(),
            message: format!("Source not found: {}", source_id),
        }
    })?;

    client.health_check(source).await.map_err(Into::into)
}
