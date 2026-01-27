import { invoke } from '@tauri-apps/api/core';
import type {
  Workspace,
  SavedRequest,
  Tab,
  TabState,
  AppSettings,
  CreateRequestInput,
  HttpRequestInput,
  ResponseData,
} from '@/types';

// ============ Workspace Commands ============

export async function getAllWorkspaces(): Promise<Workspace[]> {
  return invoke('get_all_workspaces');
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  return invoke('get_workspace', { id });
}

export async function createWorkspace(name: string): Promise<Workspace> {
  return invoke('create_workspace', { name });
}

export async function updateWorkspace(id: string, name: string): Promise<Workspace> {
  return invoke('update_workspace', { id, name });
}

export async function deleteWorkspace(id: string): Promise<void> {
  return invoke('delete_workspace', { id });
}

// ============ Request Commands ============

export async function getRequestsByWorkspace(
  workspaceId: string,
  limit?: number,
  offset?: number
): Promise<SavedRequest[]> {
  return invoke('get_requests_by_workspace', {
    workspaceId,
    limit: limit ?? null,
    offset: offset ?? null,
  });
}

export async function getRequest(id: string): Promise<SavedRequest | null> {
  return invoke('get_request', { id });
}

export async function createRequest(input: CreateRequestInput): Promise<SavedRequest> {
  return invoke('create_request', { input });
}

export async function searchRequests(
  workspaceId: string,
  query: string,
  limit?: number
): Promise<SavedRequest[]> {
  return invoke('search_requests', {
    workspaceId,
    query,
    limit: limit ?? null,
  });
}

export async function deleteRequest(id: string): Promise<void> {
  return invoke('delete_request', { id });
}

export async function clearWorkspaceHistory(workspaceId: string): Promise<number> {
  return invoke('clear_workspace_history', { workspaceId });
}

export async function getRequestCount(workspaceId: string): Promise<number> {
  return invoke('get_request_count', { workspaceId });
}

// ============ Tab Commands ============

export async function getTabsByWorkspace(workspaceId: string): Promise<Tab[]> {
  return invoke('get_tabs_by_workspace', { workspaceId });
}

export async function createTab(workspaceId: string, state?: TabState): Promise<Tab> {
  return invoke('create_tab', { workspaceId, state: state ?? null });
}

export async function updateTab(
  id: string,
  state: TabState,
  requestId?: string
): Promise<void> {
  return invoke('update_tab', { id, state, requestId: requestId ?? null });
}

export async function setActiveTab(workspaceId: string, tabId: string): Promise<void> {
  return invoke('set_active_tab', { workspaceId, tabId });
}

export async function deleteTab(id: string): Promise<string | null> {
  return invoke('delete_tab', { id });
}

export async function reorderTabs(workspaceId: string, tabIds: string[]): Promise<void> {
  return invoke('reorder_tabs', { workspaceId, tabIds });
}

export async function getTabCount(workspaceId: string): Promise<number> {
  return invoke('get_tab_count', { workspaceId });
}

// ============ Settings Commands ============

export async function getSetting(key: string): Promise<string | null> {
  return invoke('get_setting', { key });
}

export async function setSetting(key: string, value: string): Promise<void> {
  return invoke('set_setting', { key, value });
}

export async function getAllSettings(): Promise<AppSettings> {
  return invoke('get_all_settings');
}

export async function saveAllSettings(settings: AppSettings): Promise<void> {
  return invoke('save_all_settings', { settings });
}

// ============ HTTP Commands ============

export async function sendHttpRequest(
  requestId: string,
  input: HttpRequestInput
): Promise<ResponseData> {
  return invoke('send_http_request', { requestId, input });
}

export async function cancelHttpRequest(requestId: string): Promise<boolean> {
  return invoke('cancel_http_request', { requestId });
}
