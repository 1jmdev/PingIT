use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_data_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("postman.db");
        let conn = Connection::open(db_path)?;

        let db = Database {
            conn: Mutex::new(conn),
        };

        db.init_schema()?;
        db.ensure_default_workspace()?;

        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        // Workspaces table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        // Requests/History table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS requests (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                name TEXT NOT NULL,
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                params TEXT,
                headers TEXT,
                body_type TEXT,
                body_content TEXT,
                response_status INTEGER,
                response_status_text TEXT,
                response_headers TEXT,
                response_body TEXT,
                response_time_ms INTEGER,
                response_size_bytes INTEGER,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
            )",
            [],
        )?;

        // Create index on workspace_id for faster lookups
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_requests_workspace_id ON requests(workspace_id)",
            [],
        )?;

        // Create index on created_at for sorting
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC)",
            [],
        )?;

        // Full-Text Search virtual table
        conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS requests_fts USING fts5(
                id,
                name,
                url,
                body_content,
                response_body,
                content='requests',
                content_rowid='rowid'
            )",
            [],
        )?;

        // Triggers to keep FTS in sync
        conn.execute(
            "CREATE TRIGGER IF NOT EXISTS requests_ai AFTER INSERT ON requests BEGIN
                INSERT INTO requests_fts(rowid, id, name, url, body_content, response_body)
                VALUES (NEW.rowid, NEW.id, NEW.name, NEW.url, NEW.body_content, NEW.response_body);
            END",
            [],
        )?;

        conn.execute(
            "CREATE TRIGGER IF NOT EXISTS requests_ad AFTER DELETE ON requests BEGIN
                INSERT INTO requests_fts(requests_fts, rowid, id, name, url, body_content, response_body)
                VALUES ('delete', OLD.rowid, OLD.id, OLD.name, OLD.url, OLD.body_content, OLD.response_body);
            END",
            [],
        )?;

        conn.execute(
            "CREATE TRIGGER IF NOT EXISTS requests_au AFTER UPDATE ON requests BEGIN
                INSERT INTO requests_fts(requests_fts, rowid, id, name, url, body_content, response_body)
                VALUES ('delete', OLD.rowid, OLD.id, OLD.name, OLD.url, OLD.body_content, OLD.response_body);
                INSERT INTO requests_fts(rowid, id, name, url, body_content, response_body)
                VALUES (NEW.rowid, NEW.id, NEW.name, NEW.url, NEW.body_content, NEW.response_body);
            END",
            [],
        )?;

        // Tabs table for persistence
        conn.execute(
            "CREATE TABLE IF NOT EXISTS tabs (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                request_id TEXT,
                state TEXT NOT NULL,
                position INTEGER NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
            )",
            [],
        )?;

        // Settings table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;

        Ok(())
    }

    fn ensure_default_workspace(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        // Check if any workspace exists
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM workspaces", [], |row| row.get(0))?;

        if count == 0 {
            let id = uuid::Uuid::new_v4().to_string();
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as i64;

            conn.execute(
                "INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
                (&id, "Default Workspace", &now, &now),
            )?;

            // Set as active workspace
            conn.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES ('active_workspace_id', ?1)",
                [&id],
            )?;
        }

        Ok(())
    }
}
