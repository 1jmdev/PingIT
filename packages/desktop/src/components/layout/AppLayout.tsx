import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTabStore } from '@/stores/tabStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { RequestPanel } from '@/components/request/RequestPanel';
import { ResponsePanel } from '@/components/response/ResponsePanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export function AppLayout() {
  const { loadWorkspaces, activeWorkspaceId, isLoading: workspacesLoading } = useWorkspaceStore();
  const { loadTabs } = useTabStore();
  const { loadSettings, settings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
    loadWorkspaces();
  }, [loadSettings, loadWorkspaces]);

  useEffect(() => {
    if (activeWorkspaceId) {
      loadTabs(activeWorkspaceId);
    }
  }, [activeWorkspaceId, loadTabs]);

  if (workspacesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!settings.sidebar_collapsed && <Sidebar />}
        <main className="flex flex-1 flex-col overflow-hidden">
          <TabBar />
          <ResizablePanelGroup orientation="vertical" className="flex-1">
            <ResizablePanel defaultSize="50%" minSize="20%">
              <RequestPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="50%" minSize="20%">
              <ResponsePanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}
