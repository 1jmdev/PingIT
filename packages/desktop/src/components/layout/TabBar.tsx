import { useRef } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.shiftKey) return;

    const viewport = e.currentTarget.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null;

    if (viewport) {
      e.preventDefault();
      viewport.scrollLeft += e.deltaX || e.deltaY;
    }
  };

  const handleNewTab = async () => {
    if (!activeWorkspaceId) return;
    await createTab(activeWorkspaceId);
    
    // Scroll to the new tab after it's created
    requestAnimationFrame(() => {
      const viewport = scrollRef.current?.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement | null;
      if (viewport) {
        viewport.scrollLeft = viewport.scrollWidth;
      }
    });
  };

  const handleCloseTab = async (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    await closeTab(tabId);
  };

  const handleSelectTab = async (tabId: string) => {
    if (!activeWorkspaceId) return;
    await setActiveTab(activeWorkspaceId, tabId);
  };

  const getTabLabel = (tab: (typeof tabs)[0]) => {
    if (tab.state.url) {
      try {
        const url = new URL(tab.state.url);
        const label = url.host + url.pathname + (url.search || '');
        return label.replace(/\/+$/, '');
      } catch {
        return tab.state.url.replace(/^https?:\/\//, '').replace(/\/+$/, '') || 'New Request';
      }
    }
    return 'New Request';
  };

  return (
    <div className="flex items-center h-10 border-b border-border bg-muted/30">
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden"
        onWheel={handleWheel}
        style={{
          maskImage: 'linear-gradient(to right, black calc(100% - 32px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 32px), transparent 100%)',
        }}
      >
        <ScrollArea>
          <div className="flex items-center h-10 px-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={cn(
                  'group flex items-center gap-2 h-8 w-48 px-3 rounded-sm text-sm transition-colors shrink-0',
                  'hover:bg-muted',
                  activeTabId === tab.id
                    ? 'bg-background border border-border shadow-sm'
                    : 'text-muted-foreground'
                )}
              >
                <span className={cn('font-mono text-xs font-bold shrink-0', METHOD_COLORS[tab.state.method])}>
                  {tab.state.method}
                </span>
                <span
                  className="flex-1 min-w-0 text-xs truncate"
                  style={{
                    maskImage: 'linear-gradient(to right, black 75%, transparent 95%)',
                    WebkitMaskImage: 'linear-gradient(to right, black 75%, transparent 95%)',
                  }}
                >
                  {getTabLabel(tab)}
                </span>
                {tab.state.is_dirty && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className={cn(
                    'ml-1 p-0.5 rounded shrink-0',
                    'hover:bg-muted-foreground/20'
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

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
