import { useRef, useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTabStore } from '@/stores/tabStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search } from 'lucide-react';
import { Plus, X } from 'lucide-react';
import { METHOD_COLORS } from '@/lib/constants';

export function TabBar() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { tabs, activeTabId, createTab, closeTab, setActiveTab } = useTabStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('[data-tab-dropdown]') && !target.closest('[data-tab-dropdown-button]')) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
    setIsDropdownOpen(false);
    setSearchQuery('');
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

  const filteredTabs = tabs.filter(tab =>
    getTabLabel(tab).toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.state.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex items-center h-10 border-b border-border bg-muted/30">
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden"
        onWheel={handleWheel}
        style={{
          maskImage: 'linear-gradient(to right, black calc(100% - 80px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 80px), transparent 100%)',
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

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 mx-1 shrink-0 mr-2"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        data-tab-dropdown-button
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isDropdownOpen && (
        <div data-tab-dropdown className="absolute top-full right-2 z-50 mt-1 w-80 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
          <ScrollArea className="h-64">
            <div className="py-1 px-2">
              {filteredTabs.length === 0 ? (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  No tabs found
                </div>
              ) : (
                filteredTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-muted rounded-md transition-colors',
                      activeTabId === tab.id && 'bg-muted'
                    )}
                  >
                    <span className={cn('font-mono text-xs font-bold shrink-0', METHOD_COLORS[tab.state.method])}>
                      {tab.state.method}
                    </span>
                    <span className="flex-1 min-w-0 truncate">
                      {getTabLabel(tab)}
                    </span>
                    {tab.state.is_dirty && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}