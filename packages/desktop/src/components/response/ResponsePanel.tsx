import { useTabStore } from '@/stores/tabStore';

export function ResponsePanel() {
  const { activeTabId, responses, loadingTabs } = useTabStore();
  
  const response = activeTabId ? responses[activeTabId] : null;
  const isLoading = activeTabId ? loadingTabs.has(activeTabId) : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Sending request...
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Send a request to see the response
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-sm text-muted-foreground">
        Response Panel - Status: {response.status} {response.status_text}
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        TODO: Status display, headers, body viewer with JSON tree
      </div>
    </div>
  );
}
