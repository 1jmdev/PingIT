use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;

use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use reqwest::Method;
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

use crate::db::request::KeyValue;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpRequestInput {
    pub method: String,
    pub url: String,
    pub headers: Vec<KeyValue>,
    pub body_type: String,
    pub body_content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<KeyValue>,
    pub body: String,
    pub time_ms: u64,
    pub size_bytes: u64,
}

// Store for active requests that can be cancelled
lazy_static::lazy_static! {
    static ref ACTIVE_REQUESTS: Arc<Mutex<HashMap<String, tokio::sync::oneshot::Sender<()>>>> = 
        Arc::new(Mutex::new(HashMap::new()));
}

#[tauri::command]
pub async fn send_http_request(
    request_id: String,
    input: HttpRequestInput,
) -> Result<HttpResponse, String> {
    let (cancel_tx, cancel_rx) = tokio::sync::oneshot::channel::<()>();
    
    // Store the cancel sender
    {
        let mut active = ACTIVE_REQUESTS.lock().await;
        active.insert(request_id.clone(), cancel_tx);
    }

    let result = execute_request(input, cancel_rx).await;

    // Remove from active requests
    {
        let mut active = ACTIVE_REQUESTS.lock().await;
        active.remove(&request_id);
    }

    result
}

#[tauri::command]
pub async fn cancel_http_request(request_id: String) -> Result<bool, String> {
    let mut active = ACTIVE_REQUESTS.lock().await;
    if let Some(cancel_tx) = active.remove(&request_id) {
        let _ = cancel_tx.send(());
        Ok(true)
    } else {
        Ok(false)
    }
}

async fn execute_request(
    input: HttpRequestInput,
    cancel_rx: tokio::sync::oneshot::Receiver<()>,
) -> Result<HttpResponse, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(300)) // 5 minute timeout
        .build()
        .map_err(|e| e.to_string())?;

    let method = match input.method.to_uppercase().as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "PATCH" => Method::PATCH,
        "DELETE" => Method::DELETE,
        "HEAD" => Method::HEAD,
        "OPTIONS" => Method::OPTIONS,
        _ => return Err(format!("Unsupported method: {}", input.method)),
    };

    let mut request_builder = client.request(method, &input.url);

    // Add headers
    let mut headers = HeaderMap::new();
    for kv in input.headers.iter().filter(|h| h.enabled) {
        if let (Ok(name), Ok(value)) = (
            HeaderName::from_bytes(kv.key.as_bytes()),
            HeaderValue::from_str(&kv.value),
        ) {
            headers.insert(name, value);
        }
    }
    request_builder = request_builder.headers(headers);

    // Add body based on type
    if let Some(body_content) = input.body_content {
        if !body_content.is_empty() {
            match input.body_type.as_str() {
                "json" => {
                    request_builder = request_builder
                        .header("Content-Type", "application/json")
                        .body(body_content);
                }
                "raw" => {
                    request_builder = request_builder.body(body_content);
                }
                "x-www-form-urlencoded" => {
                    request_builder = request_builder
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .body(body_content);
                }
                "form-data" => {
                    // Parse form data from JSON
                    if let Ok(form_data) = serde_json::from_str::<Vec<KeyValue>>(&body_content) {
                        let mut form = reqwest::multipart::Form::new();
                        for kv in form_data.into_iter().filter(|f| f.enabled) {
                            form = form.text(kv.key, kv.value);
                        }
                        request_builder = request_builder.multipart(form);
                    }
                }
                _ => {}
            }
        }
    }

    let start = Instant::now();

    // Execute request with cancellation support
    let request_future = request_builder.send();

    tokio::select! {
        result = request_future => {
            match result {
                Ok(response) => {
                    let status = response.status().as_u16();
                    let status_text = response.status().canonical_reason().unwrap_or("").to_string();
                    
                    // Extract headers
                    let headers: Vec<KeyValue> = response
                        .headers()
                        .iter()
                        .map(|(name, value)| KeyValue {
                            key: name.to_string(),
                            value: value.to_str().unwrap_or("").to_string(),
                            enabled: true,
                            description: None,
                        })
                        .collect();

                    // Get body
                    let body_bytes = response.bytes().await.map_err(|e| e.to_string())?;
                    let size_bytes = body_bytes.len() as u64;
                    let body = String::from_utf8_lossy(&body_bytes).to_string();
                    
                    let time_ms = start.elapsed().as_millis() as u64;

                    Ok(HttpResponse {
                        status,
                        status_text,
                        headers,
                        body,
                        time_ms,
                        size_bytes,
                    })
                }
                Err(e) => Err(e.to_string()),
            }
        }
        _ = cancel_rx => {
            Err("Request cancelled".to_string())
        }
    }
}
