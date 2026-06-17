mod commands;
mod config;
mod loki;

use commands::cancel::QueryControl;
use config::store::ConfigStore;
use loki::client::LokiClient;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(LokiClient::new())
        .manage(ConfigStore::new())
        .manage(QueryControl::new())
        .invoke_handler(tauri::generate_handler![
            commands::sources::list_sources,
            commands::sources::add_source,
            commands::sources::update_source,
            commands::sources::delete_source,
            commands::sources::set_active_source,
            commands::sources::test_connection,
            commands::sources::save_last_query,
            commands::sources::load_last_query,
            commands::sources::save_prefs,
            commands::sources::load_prefs,
            commands::sources::save_query_history,
            commands::sources::load_query_history,
            commands::query::execute_query,
            commands::query::query_labels,
            commands::query::query_label_values,
            commands::health::check_source_health,
            commands::cancel::cancel_query,
        ])
        .run(tauri::generate_context!())
        .expect("error while running loki-viewer");
}
