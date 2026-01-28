import { useCallback, useState, useMemo } from 'react';
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
import { Send, X, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { KeyValueEditor } from './KeyValueEditor';
import { CodeEditor } from '@/components/ui/code-editor';

type RequestTab = 'params' | 'headers' | 'body';

export function RequestPanel() {
  const { tabs, activeTabId, updateTabState, setResponse, setTabLoading, loadingTabs, markClean } = useTabStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { addLatestRequest } = useUIStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  const isLoading = activeTabId ? loadingTabs.has(activeTabId) : false;
  const [showDefaultHeaders, setShowDefaultHeaders] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState<RequestTab>('params');

  const state = activeTab?.state;
  const method = state?.method ?? 'GET';
  const url = state?.url ?? '';
  const params = state?.params ?? [];
  const headers = state?.headers ?? [];
  const body_type = state?.body_type ?? 'none';
  const body_content = state?.body_content ?? '';

  const jsonError = body_type === 'raw' && body_content ? getJsonError(body_content) : null;
  const paramsCount = params.filter(p => p.enabled && p.key).length;
  const headersCount = headers.filter(h => h.enabled && h.key).length;

  const formDataItems = useMemo(() => {
    if (!body_content) return [];
    const trimmed = body_content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return [];
    try {
      const urlParams = new URLSearchParams(body_content);
      const items: KeyValue[] = [];
      urlParams.forEach((value, key) => {
        items.push({ key, value, enabled: true, description: '' });
      });
      return items;
    } catch {
      return [];
    }
  }, [body_content]);

  const handleMethodChange = useCallback((value: string | null) => {
    if (activeTabId && value) {
      updateTabState(activeTabId, { method: value as HttpMethod });
    }
  }, [activeTabId, updateTabState]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTabId) {
      const newUrl = e.target.value;
      updateTabState(activeTabId, { url: newUrl });
      try {
        const urlObj = new URL(newUrl);
        const newParams: KeyValue[] = [];
        urlObj.searchParams.forEach((value, key) => {
          newParams.push({ key, value, enabled: true });
        });
        if (newParams.length > 0) {
          updateTabState(activeTabId, { params: newParams });
        }
      } catch {
        // Invalid URL
      }
    }
  }, [activeTabId, updateTabState]);

  const handleParamsChange = useCallback((newParams: KeyValue[]) => {
    if (activeTabId && activeTab) {
      updateTabState(activeTabId, { params: newParams });
      try {
        const urlObj = new URL(activeTab.state.url);
        urlObj.search = '';
        newParams.filter(p => p.enabled && p.key).forEach(p => {
          urlObj.searchParams.append(p.key, p.value);
        });
        updateTabState(activeTabId, { url: urlObj.toString() });
      } catch {
        // Invalid URL
      }
    }
  }, [activeTabId, activeTab, updateTabState]);

  const handleHeadersChange = useCallback((newHeaders: KeyValue[]) => {
    if (activeTabId) {
      updateTabState(activeTabId, { headers: newHeaders });
    }
  }, [activeTabId, updateTabState]);

  const handleBodyTypeChange = useCallback((newType: string | null) => {
    if (!activeTabId || !newType || !activeTab) return;
    
    const oldType = activeTab.state.body_type;
    const newBodyType = newType as BodyType;
    
    const formTypes = ['form-data', 'x-www-form-urlencoded'];
    const textTypes = ['raw', 'xml', 'html', 'text'];
    
    const oldIsForm = formTypes.includes(oldType);
    const newIsForm = formTypes.includes(newBodyType);
    const oldIsText = textTypes.includes(oldType);
    const newIsText = textTypes.includes(newBodyType);
    
    const shouldClear = (oldIsForm && newIsText) || (oldIsText && newIsForm);
    updateTabState(activeTabId, { 
      body_type: newBodyType, 
      body_content: shouldClear ? '' : activeTab.state.body_content 
    });
  }, [activeTabId, activeTab, updateTabState]);

  const handleFormDataChange = useCallback((items: KeyValue[]) => {
    if (!activeTabId) return;
    const encoded = items
      .filter(i => i.enabled && i.key)
      .map(i => `${encodeURIComponent(i.key)}=${encodeURIComponent(i.value)}`)
      .join('&');
    updateTabState(activeTabId, { body_content: encoded });
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
      const userHeaders = headers.filter(h => h.enabled && h.key);
      const userHeaderKeys = new Set(userHeaders.map(h => h.key.toLowerCase()));
      
      const allHeaders = [
        ...DEFAULT_HEADERS.filter(h => !userHeaderKeys.has(h.key.toLowerCase())),
        ...userHeaders,
      ];
      
      if (body_type === 'raw' && !allHeaders.some(h => h.key.toLowerCase() === 'content-type')) {
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
      
      const savedRequest = await api.createRequest({
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
      
      addLatestRequest(savedRequest);
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
  }, [activeTabId, activeTab, activeWorkspaceId, setTabLoading, setResponse, markClean, addLatestRequest]);

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

      {/* Tab Bar */}
      <div className="flex items-center border-b border-border bg-muted/30">
        <button
          type="button"
          onClick={() => setActiveRequestTab('params')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeRequestTab === 'params'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          )}
        >
          Params
          {paramsCount > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
              {paramsCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveRequestTab('headers')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeRequestTab === 'headers'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          )}
        >
          Headers
          {headersCount > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
              {headersCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveRequestTab('body')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
            activeRequestTab === 'body'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          )}
        >
          Body
          {jsonError && <AlertCircle className="ml-1.5 h-3.5 w-3.5 text-destructive" />}
        </button>
      </div>

      {/* Body Type Selector */}
      {activeRequestTab === 'body' && (
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-background">
          {BODY_TYPES.map(bt => (
            <label
              key={bt.value}
              className={cn(
                "flex items-center gap-1.5 cursor-pointer text-sm",
                body_type === bt.value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <input
                type="radio"
                name="bodyType"
                value={bt.value}
                checked={body_type === bt.value}
                onChange={() => handleBodyTypeChange(bt.value)}
                className="w-3.5 h-3.5 accent-primary"
              />
              {bt.label}
            </label>
          ))}
          
          {body_type === 'raw' && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleFormatJson}
                disabled={!body_content}
              >
                Beautify
              </Button>
              {jsonError && (
                <span className="text-xs text-destructive truncate max-w-[200px]">
                  {jsonError}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-3">
        {activeRequestTab === 'params' && (
          <div className="h-full border border-border rounded-sm overflow-hidden min-h-[12rem]">
            <KeyValueEditor
              items={params}
              onChange={handleParamsChange}
              keyPlaceholder="Parameter name"
              valuePlaceholder="Value"
            />
          </div>
        )}

        {activeRequestTab === 'headers' && (
          <div className="h-full flex flex-col gap-3">
            <div className="flex-1 border border-border rounded-sm overflow-hidden min-h-[12rem]">
              <KeyValueEditor
                items={headers}
                onChange={handleHeadersChange}
                keyPlaceholder="Header name"
                valuePlaceholder="Value"
              />
            </div>
            
            <div className="border border-border rounded-sm p-3">
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
                    These headers are automatically included unless overridden.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeRequestTab === 'body' && (
          <div className="h-full flex flex-col">
            {body_type === 'none' ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border border-border rounded-sm min-h-[12rem]">
                This request does not have a body
              </div>
            ) : body_type === 'form-data' || body_type === 'x-www-form-urlencoded' ? (
              <div className="flex-1 overflow-auto border border-border rounded-sm min-h-[12rem]">
                <KeyValueEditor
                  items={formDataItems}
                  onChange={handleFormDataChange}
                  keyPlaceholder="Field name"
                  valuePlaceholder="Value"
                />
              </div>
            ) : (
              <div className="flex-1 overflow-hidden min-h-[12rem]">
                <CodeEditor
                  value={body_content}
                  onChange={(value) => {
                    if (activeTabId) {
                      updateTabState(activeTabId, { body_content: value });
                    }
                  }}
                  placeholder={body_type === 'raw' ? '{\n  "key": "value"\n}' : 'Enter request body...'}
                  hasError={!!jsonError}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
