use rusqlite::params;
use serde::{Deserialize, Serialize};

use super::Database;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Database {
    pub fn get_all_workspaces(&self) -> Result<Vec<Workspace>, String> {
        let conn = self.conn.lock().unwrap();

        let mut stmt = conn
            .prepare(
                "SELECT id, name, created_at, updated_at FROM workspaces ORDER BY created_at ASC",
            )
            .map_err(|e| e.to_string())?;

        let workspaces = stmt
            .query_map([], |row| {
                Ok(Workspace {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    created_at: row.get(2)?,
                    updated_at: row.get(3)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(workspaces)
    }

    pub fn get_workspace(&self, id: &str) -> Result<Option<Workspace>, String> {
        let conn = self.conn.lock().unwrap();

        let mut stmt = conn
            .prepare("SELECT id, name, created_at, updated_at FROM workspaces WHERE id = ?1")
            .map_err(|e| e.to_string())?;

        let workspace = stmt
            .query_row([id], |row| {
                Ok(Workspace {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    created_at: row.get(2)?,
                    updated_at: row.get(3)?,
                })
            })
            .ok();

        Ok(workspace)
    }

    pub fn create_workspace(&self, name: &str) -> Result<Workspace, String> {
        let conn = self.conn.lock().unwrap();

        let id = uuid::Uuid::new_v4().to_string();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;

        conn.execute(
            "INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
            params![&id, name, &now, &now],
        )
        .map_err(|e| e.to_string())?;

        Ok(Workspace {
            id,
            name: name.to_string(),
            created_at: now,
            updated_at: now,
        })
    }

    pub fn update_workspace(&self, id: &str, name: &str) -> Result<Workspace, String> {
        let conn = self.conn.lock().unwrap();

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;

        conn.execute(
            "UPDATE workspaces SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![name, &now, id],
        )
        .map_err(|e| e.to_string())?;

        // Get the updated workspace
        drop(conn);
        self.get_workspace(id)?
            .ok_or_else(|| "Workspace not found".to_string())
    }

    pub fn delete_workspace(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        // Check if this is the last workspace
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM workspaces", [], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        if count <= 1 {
            return Err("Cannot delete the last workspace".to_string());
        }

        // Delete the workspace (cascade will handle related data)
        conn.execute("DELETE FROM workspaces WHERE id = ?1", [id])
            .map_err(|e| e.to_string())?;

        Ok(())
    }
}
