use crate::config::store::ConfigStore;
use crate::loki::client::LokiClient;
use crate::loki::error::CommandError;
use crate::loki::types::LokiSource;
use uuid::Uuid;

#[tauri::command]
pub async fn list_sources(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
) -> Result<Vec<LokiSource>, CommandError> {
    Ok(store.load_sources(&app))
}

#[tauri::command]
pub async fn add_source(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
    name: String,
    url: String,
    tenant_id: Option<String>,
    username: Option<String>,
    password: Option<String>,
) -> Result<LokiSource, CommandError> {
    let auth = match (username, password) {
        (Some(u), Some(p)) if !u.is_empty() && !p.is_empty() => {
            Some(crate::loki::types::AuthConfig {
                username: u,
                password: p,
            })
        }
        _ => None,
    };

    let source = LokiSource {
        id: Uuid::new_v4().to_string(),
        name,
        url,
        tenant_id,
        auth,
        is_active: false,
    };

    store
        .add_source(&app, source.clone())
        .map_err(|e| CommandError {
            kind: "config".to_string(),
            message: e,
        })?;

    Ok(source)
}

#[tauri::command]
pub async fn update_source(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
    source: LokiSource,
) -> Result<(), CommandError> {
    store.update_source(&app, source).map_err(|e| CommandError {
        kind: "config".to_string(),
        message: e,
    })
}

#[tauri::command]
pub async fn delete_source(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
    source_id: String,
) -> Result<(), CommandError> {
    store
        .delete_source(&app, &source_id)
        .map_err(|e| CommandError {
            kind: "config".to_string(),
            message: e,
        })
}

#[tauri::command]
pub async fn set_active_source(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
    source_id: String,
) -> Result<(), CommandError> {
    store
        .set_active_source(&app, &source_id)
        .map_err(|e| CommandError {
            kind: "config".to_string(),
            message: e,
        })
}

#[tauri::command]
pub async fn test_connection(
    client: tauri::State<'_, LokiClient>,
    source: LokiSource,
) -> Result<bool, CommandError> {
    client.health_check(&source).await.map_err(Into::into)
}

#[tauri::command]
pub async fn save_last_query(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
    query: String,
) -> Result<(), CommandError> {
    store.save_last_query(&app, &query);
    Ok(())
}

#[tauri::command]
pub async fn load_last_query(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
) -> Result<String, CommandError> {
    Ok(store.load_last_query(&app))
}

// --- Preferences ---

#[tauri::command]
pub async fn save_prefs(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
    json: String,
) -> Result<(), CommandError> {
    store.save_prefs(&app, &json);
    Ok(())
}

#[tauri::command]
pub async fn load_prefs(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
) -> Result<String, CommandError> {
    Ok(store.load_prefs(&app))
}

// --- Query History ---

#[tauri::command]
pub async fn save_query_history(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
    json: String,
) -> Result<(), CommandError> {
    store.save_query_history(&app, &json);
    Ok(())
}

#[tauri::command]
pub async fn load_query_history(
    app: tauri::AppHandle,
    store: tauri::State<'_, ConfigStore>,
) -> Result<String, CommandError> {
    Ok(store.load_query_history(&app))
}
