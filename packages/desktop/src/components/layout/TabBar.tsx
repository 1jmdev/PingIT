import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTabStore } from '@/stores/tabStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X } from 'lucide-react';
import { METHOD_COLORS } from '@/lib/constants';

export function TabBar() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { tabs, activeTabId, createTab, closeTab, setActiveTab } = useTabStore();

  const handleNewTab = async () => {
    if (!activeWorkspaceId) return;
    await createTab(activeWorkspaceId);
  };

  const handleCloseTab = async (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    await closeTab(tabId);
  };

  const handleSelectTab = async (tabId: string) => {
    if (!activeWorkspaceId) return;
    await setActiveTab(activeWorkspaceId, tabId);
  };

  const getTabLabel = (tab: typeof tabs[0]) => {
    if (tab.state.url) {
      try {
        const url = new URL(tab.state.url);
        return url.pathname || '/';
      } catch {
        return tab.state.url.slice(0, 30) || 'New Request';
      }
    }
    return 'New Request';
  };

  return (
    <div className="flex items-center h-10 border-b border-border bg-muted/30">
      <ScrollArea className="flex-1">
        <div className="flex items-center h-10 px-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={cn(
                'group flex items-center gap-2 h-8 px-3 rounded-md text-sm transition-colors',
                'hover:bg-muted',
                activeTabId === tab.id
                  ? 'bg-background border border-border shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              <span className={cn('font-mono text-xs font-bold', METHOD_COLORS[tab.state.method])}>
                {tab.state.method}
              </span>
              <span className="max-w-[120px] truncate text-xs">
                {getTabLabel(tab)}
              </span>
              {tab.state.is_dirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                className={cn(
                  'ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-muted-foreground/20'
                )}
              >
                <X className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      </ScrollArea>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 mx-1 shrink-0"
        onClick={handleNewTab}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
