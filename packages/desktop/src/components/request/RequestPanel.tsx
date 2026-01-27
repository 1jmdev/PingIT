import { useCallback, useState } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HTTP_METHODS, METHOD_COLORS, BODY_TYPES, DEFAULT_HEADERS } from '@/lib/constants';
import { formatJson, getJsonError } from '@/lib/json';
import * as api from '@/lib/tauri';
import type { HttpMethod, BodyType, KeyValue } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, X, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { KeyValueEditor } from './KeyValueEditor';
import { Textarea } from '@/components/ui/textarea';

export function RequestPanel() {
  const { tabs, activeTabId, updateTabState, setResponse, setTabLoading, loadingTabs, markClean } = useTabStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { refreshHistory } = useUIStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  const isLoading = activeTabId ? loadingTabs.has(activeTabId) : false;
  const [showDefaultHeaders, setShowDefaultHeaders] = useState(false);

  const handleMethodChange = useCallback((value: string | null) => {
    if (activeTabId && value) {
      updateTabState(activeTabId, { method: value as HttpMethod });
    }
  }, [activeTabId, updateTabState]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTabId) {
      const url = e.target.value;
      updateTabState(activeTabId, { url });
      
      // Extract query params from URL
      try {
        const urlObj = new URL(url);
        const params: KeyValue[] = [];
        urlObj.searchParams.forEach((value, key) => {
          params.push({ key, value, enabled: true });
        });
        if (params.length > 0) {
          updateTabState(activeTabId, { params });
        }
      } catch {
        // Invalid URL, ignore
      }
    }
  }, [activeTabId, updateTabState]);

  const handleParamsChange = useCallback((params: KeyValue[]) => {
    if (activeTabId && activeTab) {
      updateTabState(activeTabId, { params });
      
      // Rebuild URL with new params
      try {
        const urlObj = new URL(activeTab.state.url);
        urlObj.search = '';
        params.filter(p => p.enabled && p.key).forEach(p => {
          urlObj.searchParams.append(p.key, p.value);
        });
        updateTabState(activeTabId, { url: urlObj.toString() });
      } catch {
        // Invalid URL, just update params
      }
    }
  }, [activeTabId, activeTab, updateTabState]);

  const handleHeadersChange = useCallback((headers: KeyValue[]) => {
    if (activeTabId) {
      updateTabState(activeTabId, { headers });
    }
  }, [activeTabId, updateTabState]);

  const handleBodyTypeChange = useCallback((value: string | null) => {
    if (activeTabId && value) {
      updateTabState(activeTabId, { body_type: value as BodyType });
    }
  }, [activeTabId, updateTabState]);

  const handleBodyContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTabId) {
      updateTabState(activeTabId, { body_content: e.target.value });
    }
  }, [activeTabId, updateTabState]);

  const handleFormatJson = useCallback(() => {
    if (activeTabId && activeTab?.state.body_content) {
      const formatted = formatJson(activeTab.state.body_content);
      updateTabState(activeTabId, { body_content: formatted });
    }
  }, [activeTabId, activeTab, updateTabState]);

  const handleSendRequest = useCallback(async () => {
    if (!activeTabId || !activeTab || !activeWorkspaceId) return;
    if (!activeTab.state.url.trim()) return;

    const { method, url, headers, body_type, body_content, params } = activeTab.state;
    
    setTabLoading(activeTabId, true);
    setResponse(activeTabId, null);

    try {
      // Prepare headers - merge default headers with user headers
      // User headers override default headers (case-insensitive)
      const userHeaders = headers.filter(h => h.enabled && h.key);
      const userHeaderKeys = new Set(userHeaders.map(h => h.key.toLowerCase()));
      
      // Add default headers that aren't overridden
      const allHeaders = [
        ...DEFAULT_HEADERS.filter(h => !userHeaderKeys.has(h.key.toLowerCase())),
        ...userHeaders,
      ];
      
      // Add Content-Type header if body type requires it
      if (body_type === 'json' && !allHeaders.some(h => h.key.toLowerCase() === 'content-type')) {
        allHeaders.push({ key: 'Content-Type', value: 'application/json', enabled: true });
      } else if (body_type === 'x-www-form-urlencoded' && !allHeaders.some(h => h.key.toLowerCase() === 'content-type')) {
        allHeaders.push({ key: 'Content-Type', value: 'application/x-www-form-urlencoded', enabled: true });
      }

      const response = await api.sendHttpRequest(activeTabId, {
        method,
        url,
        headers: allHeaders,
        body_type,
        body_content: body_type !== 'none' ? body_content : null,
      });

      setResponse(activeTabId, response);
      
      // Save to history (save user headers, not default headers)
      await api.createRequest({
        workspace_id: activeWorkspaceId,
        method,
        url,
        params: params.length > 0 ? params : null,
        headers: userHeaders.length > 0 ? userHeaders : null,
        body_type: body_type !== 'none' ? body_type : null,
        body_content: body_type !== 'none' ? body_content : null,
        response_status: response.status,
        response_status_text: response.status_text,
        response_headers: response.headers,
        response_body: response.body,
        response_time_ms: response.time_ms,
        response_size_bytes: response.size_bytes,
      });
      
      // Refresh history to show new entry
      refreshHistory();
      
      markClean(activeTabId);
    } catch (e) {
      console.error('Request failed:', e);
      setResponse(activeTabId, {
        status: 0,
        status_text: 'Error',
        headers: [],
        body: e instanceof Error ? e.message : String(e),
        time_ms: 0,
        size_bytes: 0,
      });
    } finally {
      setTabLoading(activeTabId, false);
    }
  }, [activeTabId, activeTab, activeWorkspaceId, setTabLoading, setResponse, markClean, refreshHistory]);

  const handleCancelRequest = useCallback(async () => {
    if (activeTabId) {
      await api.cancelHttpRequest(activeTabId);
      setTabLoading(activeTabId, false);
    }
  }, [activeTabId, setTabLoading]);

  if (!activeWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No workspace selected
      </div>
    );
  }

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <span className="text-sm">No open requests</span>
        <span className="text-xs">Press Ctrl+T or click + to create a new request</span>
      </div>
    );
  }

  const { method, url, params, headers, body_type, body_content } = activeTab.state;
  const jsonError = body_type === 'json' && body_content ? getJsonError(body_content) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Select value={method} onValueChange={handleMethodChange}>
          <SelectTrigger className="w-28 h-9">
            <SelectValue>
              <span className={cn('font-mono font-bold', METHOD_COLORS[method])}>
                {method}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map(m => (
              <SelectItem key={m} value={m}>
                <span className={cn('font-mono font-bold', METHOD_COLORS[m])}>
                  {m}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter request URL"
          className="flex-1 h-9 font-mono text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSendRequest();
            }
          }}
        />

        {isLoading ? (
          <Button
            variant="destructive"
            size="sm"
            className="h-9 px-4"
            onClick={handleCancelRequest}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-9 px-4"
            onClick={handleSendRequest}
            disabled={!url.trim()}
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        )}
      </div>

      {/* Tabs for Params, Headers, Body */}
      <Tabs defaultValue="params" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-2 w-fit">
          <TabsTrigger value="params" className="text-xs">
            Params {params.filter(p => p.enabled && p.key).length > 0 && (
              <span className="ml-1 text-muted-foreground">({params.filter(p => p.enabled && p.key).length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="headers" className="text-xs">
            Headers {headers.filter(h => h.enabled && h.key).length > 0 && (
              <span className="ml-1 text-muted-foreground">({headers.filter(h => h.enabled && h.key).length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="body" className="text-xs">
            Body
            {jsonError && <AlertCircle className="ml-1 h-3 w-3 text-destructive" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="flex-1 overflow-auto m-0 p-3">
          <KeyValueEditor
            items={params}
            onChange={handleParamsChange}
            keyPlaceholder="Parameter name"
            valuePlaceholder="Value"
          />
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-auto m-0 p-3">
          <KeyValueEditor
            items={headers}
            onChange={handleHeadersChange}
            keyPlaceholder="Header name"
            valuePlaceholder="Value"
          />
          
          {/* Default Headers - collapsible */}
          <div className="mt-4 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setShowDefaultHeaders(!showDefaultHeaders)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {showDefaultHeaders ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span>Default Headers ({DEFAULT_HEADERS.length})</span>
            </button>
            
            {showDefaultHeaders && (
              <div className="mt-2 space-y-1">
                {DEFAULT_HEADERS.map((header, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-xs font-mono text-muted-foreground py-1"
                  >
                    <span className="w-40 truncate">{header.key}</span>
                    <span className="text-muted-foreground/50">:</span>
                    <span className="flex-1 truncate">{header.value}</span>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground/70 mt-2">
                  These headers are automatically included in all requests unless overridden above.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="body" className="flex-1 overflow-hidden m-0 flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Select value={body_type} onValueChange={handleBodyTypeChange}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BODY_TYPES.map(bt => (
                  <SelectItem key={bt.value} value={bt.value}>
                    {bt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {body_type === 'json' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={handleFormatJson}
                  disabled={!body_content}
                >
                  Format
                </Button>
                {jsonError && (
                  <span className="text-xs text-destructive truncate flex-1">
                    {jsonError}
                  </span>
                )}
              </>
            )}
          </div>

          {body_type === 'none' ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              This request does not have a body
            </div>
          ) : body_type === 'form-data' || body_type === 'x-www-form-urlencoded' ? (
            <div className="flex-1 overflow-auto p-3">
              <KeyValueEditor
                items={body_content ? parseFormData(body_content) : []}
                onChange={(items: KeyValue[]) => {
                  const encoded = items
                    .filter((i: KeyValue) => i.enabled && i.key)
                    .map((i: KeyValue) => `${encodeURIComponent(i.key)}=${encodeURIComponent(i.value)}`)
                    .join('&');
                  if (activeTabId) {
                    updateTabState(activeTabId, { body_content: encoded });
                  }
                }}
                keyPlaceholder="Field name"
                valuePlaceholder="Value"
              />
            </div>
          ) : (
            <div className="flex-1 p-3 overflow-hidden">
              <Textarea
                value={body_content}
                onChange={handleBodyContentChange}
                placeholder={body_type === 'json' ? '{\n  "key": "value"\n}' : 'Enter request body...'}
                className={cn(
                  'h-full resize-none font-mono text-sm',
                  jsonError && 'border-destructive'
                )}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function parseFormData(encoded: string): KeyValue[] {
  if (!encoded) return [];
  try {
    const params = new URLSearchParams(encoded);
    const items: KeyValue[] = [];
    params.forEach((value, key) => {
      items.push({ key, value, enabled: true });
    });
    return items;
  } catch {
    return [];
  }
}
