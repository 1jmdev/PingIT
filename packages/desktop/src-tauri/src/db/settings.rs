use rusqlite::params;
use serde::{Deserialize, Serialize};

use super::Database;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub sidebar_collapsed: bool,
    pub active_workspace_id: Option<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            sidebar_collapsed: false,
            active_workspace_id: None,
        }
    }
}

impl Database {
    pub fn get_setting(&self, key: &str) -> Result<Option<String>, String> {
        let conn = self.conn.lock().unwrap();

        let value: Option<String> = conn
            .query_row("SELECT value FROM settings WHERE key = ?1", [key], |row| {
                row.get(0)
            })
            .ok();

        Ok(value)
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            params![key, value],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn get_all_settings(&self) -> Result<AppSettings, String> {
        let theme = self
            .get_setting("theme")?
            .unwrap_or_else(|| "dark".to_string());
        let sidebar_collapsed = self
            .get_setting("sidebar_collapsed")?
            .map(|v| v == "true")
            .unwrap_or(false);
        let active_workspace_id = self.get_setting("active_workspace_id")?;

        Ok(AppSettings {
            theme,
            sidebar_collapsed,
            active_workspace_id,
        })
    }

    pub fn save_all_settings(&self, settings: &AppSettings) -> Result<(), String> {
        self.set_setting("theme", &settings.theme)?;
        self.set_setting("sidebar_collapsed", &settings.sidebar_collapsed.to_string())?;
        if let Some(ref id) = settings.active_workspace_id {
            self.set_setting("active_workspace_id", id)?;
        }
        Ok(())
    }
}
