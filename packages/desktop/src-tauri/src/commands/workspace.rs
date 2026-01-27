use tauri::State;

use crate::db::workspace::Workspace;
use crate::db::Database;

#[tauri::command]
pub fn get_all_workspaces(db: State<'_, Database>) -> Result<Vec<Workspace>, String> {
    db.get_all_workspaces()
}

#[tauri::command]
pub fn get_workspace(db: State<'_, Database>, id: String) -> Result<Option<Workspace>, String> {
    db.get_workspace(&id)
}

#[tauri::command]
pub fn create_workspace(db: State<'_, Database>, name: String) -> Result<Workspace, String> {
    db.create_workspace(&name)
}

#[tauri::command]
pub fn update_workspace(
    db: State<'_, Database>,
    id: String,
    name: String,
) -> Result<Workspace, String> {
    db.update_workspace(&id, &name)
}

#[tauri::command]
pub fn delete_workspace(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.delete_workspace(&id)
}
