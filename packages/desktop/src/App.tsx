import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTabStore } from '@/stores/tabStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TabBar } from '@/components/layout/TabBar';
import { RequestPanel } from '@/components/request/RequestPanel';
import { ResponsePanel } from '@/components/response/ResponsePanel';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { WorkspaceDialog } from '@/components/settings/WorkspaceDialog';
import { ClearHistoryDialog } from '@/components/settings/ClearHistoryDialog';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export default function App() {
  const { loadWorkspaces, activeWorkspaceId, isLoading: workspacesLoading } = useWorkspaceStore();
  const { loadTabs } = useTabStore();
  const { loadSettings, settings } = useSettingsStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

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
      
      {/* Dialogs */}
      <SettingsDialog />
      <WorkspaceDialog />
      <ClearHistoryDialog />
    </div>
  );
}
