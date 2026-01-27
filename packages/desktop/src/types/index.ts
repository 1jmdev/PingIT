// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Body Types
export type BodyType = 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';

// Key-Value pair for headers, params, form data
export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// Workspace
export interface Workspace {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

// Saved Request (from history)
export interface SavedRequest {
  id: string;
  workspace_id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValue[] | null;
  headers: KeyValue[] | null;
  body_type: BodyType | null;
  body_content: string | null;
  response_status: number | null;
  response_status_text: string | null;
  response_headers: KeyValue[] | null;
  response_body: string | null;
  response_time_ms: number | null;
  response_size_bytes: number | null;
  created_at: number;
  updated_at: number;
}

// Tab State (editor state)
export interface TabState {
  method: HttpMethod;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  body_type: BodyType;
  body_content: string;
  is_dirty: boolean;
}

// Tab
export interface Tab {
  id: string;
  workspace_id: string;
  request_id: string | null;
  state: TabState;
  position: number;
  is_active: boolean;
}

// Response data from HTTP request
export interface ResponseData {
  status: number;
  status_text: string;
  headers: KeyValue[];
  body: string;
  time_ms: number;
  size_bytes: number;
}

// App Settings
export interface AppSettings {
  theme: 'light' | 'dark';
  sidebar_collapsed: boolean;
  active_workspace_id: string | null;
}

// HTTP Request Input (for sending)
export interface HttpRequestInput {
  method: string;
  url: string;
  headers: KeyValue[];
  body_type: string;
  body_content: string | null;
}

// Create Request Input (for saving to history)
export interface CreateRequestInput {
  workspace_id: string;
  method: string;
  url: string;
  params: KeyValue[] | null;
  headers: KeyValue[] | null;
  body_type: string | null;
  body_content: string | null;
  response_status: number | null;
  response_status_text: string | null;
  response_headers: KeyValue[] | null;
  response_body: string | null;
  response_time_ms: number | null;
  response_size_bytes: number | null;
}
