import { useTabStore } from '@/stores/tabStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function RequestPanel() {
  const { tabs, activeTabId } = useTabStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab || !activeWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No active request
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-sm text-muted-foreground">
        Request Panel - {activeTab.state.method} {activeTab.state.url || '(empty)'}
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        TODO: URL input, method selector, headers, body editor
      </div>
    </div>
  );
}
