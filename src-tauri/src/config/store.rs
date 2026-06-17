use crate::loki::types::LokiSource;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_FILE: &str = "config.json";
const SOURCES_KEY: &str = "loki-sources";
const LAST_QUERY_KEY: &str = "last-query";
const PREFS_KEY: &str = "preferences";
const QUERY_HISTORY_KEY: &str = "query-history";

pub struct ConfigStore;

impl ConfigStore {
    pub fn new() -> Self {
        Self
    }

    pub fn load_sources(&self, app: &AppHandle) -> Vec<LokiSource> {
        let store = match app.store(STORE_FILE) {
            Ok(s) => s,
            Err(_) => return Vec::new(),
        };
        store
            .get(SOURCES_KEY)
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default()
    }

    pub fn save_sources(&self, app: &AppHandle, sources: &[LokiSource]) {
        if let Ok(store) = app.store(STORE_FILE) {
            let value = serde_json::to_value(sources).unwrap_or_default();
            store.set(SOURCES_KEY.to_string(), value);
            let _ = store.save();
        }
    }

    pub fn add_source(&self, app: &AppHandle, source: LokiSource) -> Result<(), String> {
        let mut sources = self.load_sources(app);
        sources.push(source);
        self.save_sources(app, &sources);
        Ok(())
    }

    pub fn update_source(&self, app: &AppHandle, source: LokiSource) -> Result<(), String> {
        let mut sources = self.load_sources(app);
        if let Some(pos) = sources.iter_mut().find(|s| s.id == source.id) {
            *pos = source;
            self.save_sources(app, &sources);
            Ok(())
        } else {
            Err("Source not found".to_string())
        }
    }

    pub fn delete_source(&self, app: &AppHandle, source_id: &str) -> Result<(), String> {
        let mut sources = self.load_sources(app);
        sources.retain(|s| s.id != source_id);
        self.save_sources(app, &sources);
        Ok(())
    }

    pub fn set_active_source(&self, app: &AppHandle, source_id: &str) -> Result<(), String> {
        let mut sources = self.load_sources(app);
        for source in sources.iter_mut() {
            source.is_active = source.id == source_id;
        }
        self.save_sources(app, &sources);
        Ok(())
    }

    pub fn save_last_query(&self, app: &AppHandle, query: &str) {
        if let Ok(store) = app.store(STORE_FILE) {
            store.set(LAST_QUERY_KEY.to_string(), serde_json::json!(query));
            let _ = store.save();
        }
    }

    pub fn load_last_query(&self, app: &AppHandle) -> String {
        let store = match app.store(STORE_FILE) {
            Ok(s) => s,
            Err(_) => return String::new(),
        };
        store
            .get(LAST_QUERY_KEY)
            .and_then(|v| v.as_str().map(String::from))
            .unwrap_or_default()
    }

    // --- Preferences ---

    pub fn save_prefs(&self, app: &AppHandle, json: &str) {
        if let Ok(store) = app.store(STORE_FILE) {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(json) {
                store.set(PREFS_KEY.to_string(), value);
                let _ = store.save();
            }
        }
    }

    pub fn load_prefs(&self, app: &AppHandle) -> String {
        let store = match app.store(STORE_FILE) {
            Ok(s) => s,
            Err(_) => return "{}".to_string(),
        };
        store
            .get(PREFS_KEY)
            .map(|v| v.to_string())
            .unwrap_or_else(|| "{}".to_string())
    }

    // --- Query History ---

    pub fn save_query_history(&self, app: &AppHandle, json: &str) {
        if let Ok(store) = app.store(STORE_FILE) {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(json) {
                store.set(QUERY_HISTORY_KEY.to_string(), value);
                let _ = store.save();
            }
        }
    }

    pub fn load_query_history(&self, app: &AppHandle) -> String {
        let store = match app.store(STORE_FILE) {
            Ok(s) => s,
            Err(_) => return "[]".to_string(),
        };
        store
            .get(QUERY_HISTORY_KEY)
            .map(|v| v.to_string())
            .unwrap_or_else(|| "[]".to_string())
    }
}
