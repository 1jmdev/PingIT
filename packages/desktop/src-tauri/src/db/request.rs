use rusqlite::params;
use serde::{Deserialize, Serialize};

use super::Database;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyValue {
    pub key: String,
    pub value: String,
    pub enabled: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedRequest {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub method: String,
    pub url: String,
    pub params: Option<Vec<KeyValue>>,
    pub headers: Option<Vec<KeyValue>>,
    pub body_type: Option<String>,
    pub body_content: Option<String>,
    pub response_status: Option<i32>,
    pub response_status_text: Option<String>,
    pub response_headers: Option<Vec<KeyValue>>,
    pub response_body: Option<String>,
    pub response_time_ms: Option<i64>,
    pub response_size_bytes: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRequestInput {
    pub workspace_id: String,
    pub method: String,
    pub url: String,
    pub params: Option<Vec<KeyValue>>,
    pub headers: Option<Vec<KeyValue>>,
    pub body_type: Option<String>,
    pub body_content: Option<String>,
    pub response_status: Option<i32>,
    pub response_status_text: Option<String>,
    pub response_headers: Option<Vec<KeyValue>>,
    pub response_body: Option<String>,
    pub response_time_ms: Option<i64>,
    pub response_size_bytes: Option<i64>,
}

impl Database {
    pub fn get_requests_by_workspace(
        &self,
        workspace_id: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<SavedRequest>, String> {
        let conn = self.conn.lock().unwrap();

        let limit = limit.unwrap_or(100);
        let offset = offset.unwrap_or(0);

        let mut stmt = conn
            .prepare(
                "SELECT id, workspace_id, name, method, url, params, headers, body_type, body_content,
                        response_status, response_status_text, response_headers, response_body,
                        response_time_ms, response_size_bytes, created_at, updated_at
                 FROM requests 
                 WHERE workspace_id = ?1 
                 ORDER BY created_at DESC 
                 LIMIT ?2 OFFSET ?3",
            )
            .map_err(|e| e.to_string())?;

        let requests = stmt
            .query_map(params![workspace_id, limit, offset], |row| {
                let params_json: Option<String> = row.get(5)?;
                let headers_json: Option<String> = row.get(6)?;
                let response_headers_json: Option<String> = row.get(11)?;

                Ok(SavedRequest {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    name: row.get(2)?,
                    method: row.get(3)?,
                    url: row.get(4)?,
                    params: params_json.and_then(|s| serde_json::from_str(&s).ok()),
                    headers: headers_json.and_then(|s| serde_json::from_str(&s).ok()),
                    body_type: row.get(7)?,
                    body_content: row.get(8)?,
                    response_status: row.get(9)?,
                    response_status_text: row.get(10)?,
                    response_headers: response_headers_json
                        .and_then(|s| serde_json::from_str(&s).ok()),
                    response_body: row.get(12)?,
                    response_time_ms: row.get(13)?,
                    response_size_bytes: row.get(14)?,
                    created_at: row.get(15)?,
                    updated_at: row.get(16)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(requests)
    }

    pub fn get_request(&self, id: &str) -> Result<Option<SavedRequest>, String> {
        let conn = self.conn.lock().unwrap();

        let mut stmt = conn
            .prepare(
                "SELECT id, workspace_id, name, method, url, params, headers, body_type, body_content,
                        response_status, response_status_text, response_headers, response_body,
                        response_time_ms, response_size_bytes, created_at, updated_at
                 FROM requests WHERE id = ?1",
            )
            .map_err(|e| e.to_string())?;

        let request = stmt
            .query_row([id], |row| {
                let params_json: Option<String> = row.get(5)?;
                let headers_json: Option<String> = row.get(6)?;
                let response_headers_json: Option<String> = row.get(11)?;

                Ok(SavedRequest {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    name: row.get(2)?,
                    method: row.get(3)?,
                    url: row.get(4)?,
                    params: params_json.and_then(|s| serde_json::from_str(&s).ok()),
                    headers: headers_json.and_then(|s| serde_json::from_str(&s).ok()),
                    body_type: row.get(7)?,
                    body_content: row.get(8)?,
                    response_status: row.get(9)?,
                    response_status_text: row.get(10)?,
                    response_headers: response_headers_json
                        .and_then(|s| serde_json::from_str(&s).ok()),
                    response_body: row.get(12)?,
                    response_time_ms: row.get(13)?,
                    response_size_bytes: row.get(14)?,
                    created_at: row.get(15)?,
                    updated_at: row.get(16)?,
                })
            })
            .ok();

        Ok(request)
    }

    pub fn create_request(&self, input: CreateRequestInput) -> Result<SavedRequest, String> {
        let conn = self.conn.lock().unwrap();

        let id = uuid::Uuid::new_v4().to_string();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;

        // Generate name from method and URL
        let name = format!("{} {}", input.method, extract_path(&input.url));

        let params_json = input
            .params
            .as_ref()
            .and_then(|p| serde_json::to_string(p).ok());
        let headers_json = input
            .headers
            .as_ref()
            .and_then(|h| serde_json::to_string(h).ok());
        let response_headers_json = input
            .response_headers
            .as_ref()
            .and_then(|h| serde_json::to_string(h).ok());

        conn.execute(
            "INSERT INTO requests (id, workspace_id, name, method, url, params, headers, body_type, body_content,
                                   response_status, response_status_text, response_headers, response_body,
                                   response_time_ms, response_size_bytes, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            params![
                &id,
                &input.workspace_id,
                &name,
                &input.method,
                &input.url,
                &params_json,
                &headers_json,
                &input.body_type,
                &input.body_content,
                &input.response_status,
                &input.response_status_text,
                &response_headers_json,
                &input.response_body,
                &input.response_time_ms,
                &input.response_size_bytes,
                &now,
                &now,
            ],
        )
        .map_err(|e| e.to_string())?;

        Ok(SavedRequest {
            id,
            workspace_id: input.workspace_id,
            name,
            method: input.method,
            url: input.url,
            params: input.params,
            headers: input.headers,
            body_type: input.body_type,
            body_content: input.body_content,
            response_status: input.response_status,
            response_status_text: input.response_status_text,
            response_headers: input.response_headers,
            response_body: input.response_body,
            response_time_ms: input.response_time_ms,
            response_size_bytes: input.response_size_bytes,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn search_requests(
        &self,
        workspace_id: &str,
        query: &str,
        limit: Option<i64>,
    ) -> Result<Vec<SavedRequest>, String> {
        let conn = self.conn.lock().unwrap();
        let limit = limit.unwrap_or(50);

        // Use FTS5 for search
        let mut stmt = conn
            .prepare(
                "SELECT r.id, r.workspace_id, r.name, r.method, r.url, r.params, r.headers, r.body_type, r.body_content,
                        r.response_status, r.response_status_text, r.response_headers, r.response_body,
                        r.response_time_ms, r.response_size_bytes, r.created_at, r.updated_at
                 FROM requests r
                 INNER JOIN requests_fts fts ON r.id = fts.id
                 WHERE r.workspace_id = ?1 AND requests_fts MATCH ?2
                 ORDER BY r.created_at DESC
                 LIMIT ?3",
            )
            .map_err(|e| e.to_string())?;

        // Prepare query for FTS5 (add * for prefix matching)
        let fts_query = format!("{}*", query.replace('"', ""));

        let requests = stmt
            .query_map(params![workspace_id, &fts_query, limit], |row| {
                let params_json: Option<String> = row.get(5)?;
                let headers_json: Option<String> = row.get(6)?;
                let response_headers_json: Option<String> = row.get(11)?;

                Ok(SavedRequest {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    name: row.get(2)?,
                    method: row.get(3)?,
                    url: row.get(4)?,
                    params: params_json.and_then(|s| serde_json::from_str(&s).ok()),
                    headers: headers_json.and_then(|s| serde_json::from_str(&s).ok()),
                    body_type: row.get(7)?,
                    body_content: row.get(8)?,
                    response_status: row.get(9)?,
                    response_status_text: row.get(10)?,
                    response_headers: response_headers_json
                        .and_then(|s| serde_json::from_str(&s).ok()),
                    response_body: row.get(12)?,
                    response_time_ms: row.get(13)?,
                    response_size_bytes: row.get(14)?,
                    created_at: row.get(15)?,
                    updated_at: row.get(16)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(requests)
    }

    pub fn delete_request(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM requests WHERE id = ?1", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn clear_workspace_history(&self, workspace_id: &str) -> Result<i64, String> {
        let conn = self.conn.lock().unwrap();
        let changes = conn
            .execute(
                "DELETE FROM requests WHERE workspace_id = ?1",
                [workspace_id],
            )
            .map_err(|e| e.to_string())?;
        Ok(changes as i64)
    }

    pub fn get_request_count(&self, workspace_id: &str) -> Result<i64, String> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM requests WHERE workspace_id = ?1",
                [workspace_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;
        Ok(count)
    }
}

fn extract_path(url: &str) -> &str {
    // Try to extract path from URL
    if let Some(idx) = url.find("://") {
        let after_protocol = &url[idx + 3..];
        if let Some(path_idx) = after_protocol.find('/') {
            return &after_protocol[path_idx..];
        }
    }
    url
}
