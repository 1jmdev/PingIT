use tauri::State;

use crate::db::settings::AppSettings;
use crate::db::Database;

#[tauri::command]
pub fn get_setting(db: State<'_, Database>, key: String) -> Result<Option<String>, String> {
    db.get_setting(&key)
}

#[tauri::command]
pub fn set_setting(db: State<'_, Database>, key: String, value: String) -> Result<(), String> {
    db.set_setting(&key, &value)
}

#[tauri::command]
pub fn get_all_settings(db: State<'_, Database>) -> Result<AppSettings, String> {
    db.get_all_settings()
}

#[tauri::command]
pub fn save_all_settings(db: State<'_, Database>, settings: AppSettings) -> Result<(), String> {
    db.save_all_settings(&settings)
}
