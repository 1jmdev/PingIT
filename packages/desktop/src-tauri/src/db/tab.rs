use rusqlite::params;
use serde::{Deserialize, Serialize};

use super::Database;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tab {
    pub id: String,
    pub workspace_id: String,
    pub request_id: Option<String>,
    pub state: TabState,
    pub position: i32,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabState {
    pub method: String,
    pub url: String,
    pub params: Vec<super::request::KeyValue>,
    pub headers: Vec<super::request::KeyValue>,
    pub body_type: String,
    pub body_content: String,
    pub is_dirty: bool,
}

impl Default for TabState {
    fn default() -> Self {
        Self {
            method: "GET".to_string(),
            url: String::new(),
            params: Vec::new(),
            headers: Vec::new(),
            body_type: "none".to_string(),
            body_content: String::new(),
            is_dirty: false,
        }
    }
}

impl Database {
    pub fn get_tabs_by_workspace(&self, workspace_id: &str) -> Result<Vec<Tab>, String> {
        let conn = self.conn.lock().unwrap();

        let mut stmt = conn
            .prepare(
                "SELECT id, workspace_id, request_id, state, position, is_active
                 FROM tabs 
                 WHERE workspace_id = ?1 
                 ORDER BY position ASC",
            )
            .map_err(|e| e.to_string())?;

        let tabs = stmt
            .query_map([workspace_id], |row| {
                let state_json: String = row.get(3)?;
                let state: TabState = serde_json::from_str(&state_json).unwrap_or_default();
                let is_active: i32 = row.get(5)?;

                Ok(Tab {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    request_id: row.get(2)?,
                    state,
                    position: row.get(4)?,
                    is_active: is_active == 1,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(tabs)
    }

    pub fn create_tab(&self, workspace_id: &str, state: Option<TabState>) -> Result<Tab, String> {
        let conn = self.conn.lock().unwrap();

        let id = uuid::Uuid::new_v4().to_string();
        let state = state.unwrap_or_default();
        let state_json = serde_json::to_string(&state).map_err(|e| e.to_string())?;

        // Get next position
        let max_position: i32 = conn
            .query_row(
                "SELECT COALESCE(MAX(position), -1) FROM tabs WHERE workspace_id = ?1",
                [workspace_id],
                |row| row.get(0),
            )
            .unwrap_or(-1);

        let position = max_position + 1;

        // Deactivate all other tabs
        conn.execute(
            "UPDATE tabs SET is_active = 0 WHERE workspace_id = ?1",
            [workspace_id],
        )
        .map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO tabs (id, workspace_id, request_id, state, position, is_active)
             VALUES (?1, ?2, NULL, ?3, ?4, 1)",
            params![&id, workspace_id, &state_json, &position],
        )
        .map_err(|e| e.to_string())?;

        Ok(Tab {
            id,
            workspace_id: workspace_id.to_string(),
            request_id: None,
            state,
            position,
            is_active: true,
        })
    }

    pub fn update_tab(
        &self,
        id: &str,
        state: TabState,
        request_id: Option<String>,
    ) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let state_json = serde_json::to_string(&state).map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE tabs SET state = ?1, request_id = ?2 WHERE id = ?3",
            params![&state_json, &request_id, id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn set_active_tab(&self, workspace_id: &str, tab_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        // Deactivate all tabs in workspace
        conn.execute(
            "UPDATE tabs SET is_active = 0 WHERE workspace_id = ?1",
            [workspace_id],
        )
        .map_err(|e| e.to_string())?;

        // Activate the specified tab
        conn.execute("UPDATE tabs SET is_active = 1 WHERE id = ?1", [tab_id])
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn delete_tab(&self, id: &str) -> Result<Option<String>, String> {
        let conn = self.conn.lock().unwrap();

        // Get tab info before deleting
        let tab_info: Option<(String, i32, i32)> = conn
            .query_row(
                "SELECT workspace_id, position, is_active FROM tabs WHERE id = ?1",
                [id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .ok();

        conn.execute("DELETE FROM tabs WHERE id = ?1", [id])
            .map_err(|e| e.to_string())?;

        // If the deleted tab was active, activate the nearest tab
        if let Some((workspace_id, position, is_active)) = tab_info {
            if is_active == 1 {
                // Try to activate the tab at the same position or the one before
                let next_tab_id: Option<String> = conn
                    .query_row(
                        "SELECT id FROM tabs WHERE workspace_id = ?1 ORDER BY ABS(position - ?2) LIMIT 1",
                        params![&workspace_id, &position],
                        |row| row.get(0),
                    )
                    .ok();

                if let Some(next_id) = next_tab_id.clone() {
                    conn.execute("UPDATE tabs SET is_active = 1 WHERE id = ?1", [&next_id])
                        .map_err(|e| e.to_string())?;
                }

                return Ok(next_tab_id);
            }
        }

        Ok(None)
    }

    pub fn reorder_tabs(&self, workspace_id: &str, tab_ids: Vec<String>) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        for (position, tab_id) in tab_ids.iter().enumerate() {
            conn.execute(
                "UPDATE tabs SET position = ?1 WHERE id = ?2 AND workspace_id = ?3",
                params![&(position as i32), tab_id, workspace_id],
            )
            .map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub fn get_tab_count(&self, workspace_id: &str) -> Result<i64, String> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM tabs WHERE workspace_id = ?1",
                [workspace_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;
        Ok(count)
    }
}
