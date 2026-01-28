import { useState, useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTabStore } from '@/stores/tabStore';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { METHOD_COLORS } from '@/lib/constants';
import type { SavedRequest } from '@/types';
import * as api from '@/lib/tauri';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  Search,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit2,
  Clock,
} from 'lucide-react';

export function Sidebar() {
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const { openRequest } = useTabStore();
  const { historySearchQuery, setHistorySearchQuery, historyRefreshTrigger, latestRequest, openWorkspaceDialog, openClearHistoryDialog } = useUIStore();
  const { toggleSidebar } = useSettingsStore();
  
  const [history, setHistory] = useState<SavedRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!activeWorkspaceId) return;
    
    setIsLoadingHistory(true);
    try {
      let requests: SavedRequest[];
      if (historySearchQuery.trim()) {
        requests = await api.searchRequests(activeWorkspaceId, historySearchQuery, 100);
      } else {
        requests = await api.getRequestsByWorkspace(activeWorkspaceId, 100, 0);
      }
      setHistory(requests);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [activeWorkspaceId, historySearchQuery, historyRefreshTrigger]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (latestRequest && latestRequest.workspace_id === activeWorkspaceId) {
      setHistory(prev => [latestRequest, ...prev]);
    }
  }, [latestRequest, activeWorkspaceId]);

  const handleOpenRequest = async (request: SavedRequest) => {
    if (!activeWorkspaceId) return;
    
    // Build response data if available
    const response = request.response_status != null ? {
      status: request.response_status,
      status_text: request.response_status_text ?? '',
      headers: request.response_headers ?? [],
      body: request.response_body ?? '',
      time_ms: request.response_time_ms ?? 0,
      size_bytes: request.response_size_bytes ?? 0,
    } : null;
    
    await openRequest(activeWorkspaceId, {
      method: request.method,
      url: request.url,
      params: request.params,
      headers: request.headers,
      body_type: request.body_type,
      body_content: request.body_content,
    }, response);
  };

  const handleWorkspaceChange = (value: string | null) => {
    if (value) {
      setActiveWorkspace(value);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUrlPath = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <aside className="flex flex-col w-72 border-r border-border bg-muted/30">
      {/* Workspace selector */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Select value={activeWorkspaceId ?? ''} onValueChange={handleWorkspaceChange}>
          <SelectTrigger className="flex-1 h-8">
            <SelectValue placeholder="Select workspace">
              {activeWorkspace?.name ?? 'Select workspace'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {workspaces.map(w => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openWorkspaceDialog('create')}>
              <Plus className="h-4 w-4 mr-2" />
              New workspace
            </DropdownMenuItem>
            {activeWorkspace && (
              <>
                <DropdownMenuItem onClick={() => openWorkspaceDialog('rename', activeWorkspaceId!)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {workspaces.length > 1 && (
                  <DropdownMenuItem
                    onClick={() => openWorkspaceDialog('delete', activeWorkspaceId!)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={historySearchQuery}
            onChange={e => setHistorySearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      {/* History header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          History
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={openClearHistoryDialog}
          >
            Clear
          </Button>
        )}
      </div>

      {/* History list */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-2">
          {isLoadingHistory ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {historySearchQuery ? 'No results found' : 'No history yet'}
            </div>
          ) : (
            <div className="space-y-1">
              {history.map(request => (
                <button
                  key={request.id}
                  onClick={() => handleOpenRequest(request)}
                  className="w-full text-left p-2 rounded-sm hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-mono font-bold w-12', METHOD_COLORS[request.method])}>
                      {request.method}
                    </span>
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {getUrlPath(request.url)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/70 truncate flex-1">
                      {request.url}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0">
                      {formatTime(request.created_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
