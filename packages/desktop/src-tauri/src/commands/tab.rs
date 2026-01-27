use tauri::State;

use crate::db::tab::{Tab, TabState};
use crate::db::Database;

#[tauri::command]
pub fn get_tabs_by_workspace(
    db: State<'_, Database>,
    workspace_id: String,
) -> Result<Vec<Tab>, String> {
    db.get_tabs_by_workspace(&workspace_id)
}

#[tauri::command]
pub fn create_tab(
    db: State<'_, Database>,
    workspace_id: String,
    state: Option<TabState>,
) -> Result<Tab, String> {
    db.create_tab(&workspace_id, state)
}

#[tauri::command]
pub fn update_tab(
    db: State<'_, Database>,
    id: String,
    state: TabState,
    request_id: Option<String>,
) -> Result<(), String> {
    db.update_tab(&id, state, request_id)
}

#[tauri::command]
pub fn set_active_tab(
    db: State<'_, Database>,
    workspace_id: String,
    tab_id: String,
) -> Result<(), String> {
    db.set_active_tab(&workspace_id, &tab_id)
}

#[tauri::command]
pub fn delete_tab(db: State<'_, Database>, id: String) -> Result<Option<String>, String> {
    db.delete_tab(&id)
}

#[tauri::command]
pub fn reorder_tabs(
    db: State<'_, Database>,
    workspace_id: String,
    tab_ids: Vec<String>,
) -> Result<(), String> {
    db.reorder_tabs(&workspace_id, tab_ids)
}

#[tauri::command]
pub fn get_tab_count(db: State<'_, Database>, workspace_id: String) -> Result<i64, String> {
    db.get_tab_count(&workspace_id)
}
