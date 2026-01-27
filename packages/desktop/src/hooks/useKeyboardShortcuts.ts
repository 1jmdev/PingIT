import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTabStore } from '@/stores/tabStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function useKeyboardShortcuts() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { createTab, closeTab, activeTabId } = useTabStore();
  const { toggleSidebar } = useSettingsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd key
      const isMod = e.ctrlKey || e.metaKey;

      if (!isMod) return;

      // Ctrl+T: New tab
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        if (activeWorkspaceId) {
          createTab(activeWorkspaceId);
        }
        return;
      }

      // Ctrl+W: Close current tab
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
        return;
      }

      // Ctrl+B: Toggle sidebar
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Note: Ctrl+Enter for sending requests is handled in RequestPanel component
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWorkspaceId, activeTabId, createTab, closeTab, toggleSidebar]);
}
