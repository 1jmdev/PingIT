use tauri::State;

use crate::db::request::{CreateRequestInput, SavedRequest};
use crate::db::Database;

#[tauri::command]
pub fn get_requests_by_workspace(
    db: State<'_, Database>,
    workspace_id: String,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<SavedRequest>, String> {
    db.get_requests_by_workspace(&workspace_id, limit, offset)
}

#[tauri::command]
pub fn get_request(db: State<'_, Database>, id: String) -> Result<Option<SavedRequest>, String> {
    db.get_request(&id)
}

#[tauri::command]
pub fn create_request(
    db: State<'_, Database>,
    input: CreateRequestInput,
) -> Result<SavedRequest, String> {
    db.create_request(input)
}

#[tauri::command]
pub fn search_requests(
    db: State<'_, Database>,
    workspace_id: String,
    query: String,
    limit: Option<i64>,
) -> Result<Vec<SavedRequest>, String> {
    db.search_requests(&workspace_id, &query, limit)
}

#[tauri::command]
pub fn delete_request(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.delete_request(&id)
}

#[tauri::command]
pub fn clear_workspace_history(
    db: State<'_, Database>,
    workspace_id: String,
) -> Result<i64, String> {
    db.clear_workspace_history(&workspace_id)
}

#[tauri::command]
pub fn get_request_count(db: State<'_, Database>, workspace_id: String) -> Result<i64, String> {
    db.get_request_count(&workspace_id)
}
