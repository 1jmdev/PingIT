mod db;
mod commands;

use std::path::PathBuf;
use tauri::Manager;
use db::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get app data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from("."));
            
            // Initialize database
            let db = Database::new(app_data_dir)
                .expect("Failed to initialize database");
            
            // Store database in app state
            app.manage(db);
            
            // Maximize window on startup
            let main_window = app.get_webview_window("main").unwrap();
            main_window.maximize()?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Workspace commands
            commands::get_all_workspaces,
            commands::get_workspace,
            commands::create_workspace,
            commands::update_workspace,
            commands::delete_workspace,
            // Request commands
            commands::get_requests_by_workspace,
            commands::get_request,
            commands::create_request,
            commands::search_requests,
            commands::delete_request,
            commands::clear_workspace_history,
            commands::get_request_count,
            // Tab commands
            commands::get_tabs_by_workspace,
            commands::create_tab,
            commands::update_tab,
            commands::set_active_tab,
            commands::delete_tab,
            commands::reorder_tabs,
            commands::get_tab_count,
            // Settings commands
            commands::get_setting,
            commands::set_setting,
            commands::get_all_settings,
            commands::save_all_settings,
            // HTTP commands
            commands::send_http_request,
            commands::cancel_http_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
