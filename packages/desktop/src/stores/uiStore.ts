import { create } from 'zustand';
import type { SavedRequest } from '@/types';

interface UIState {
  // History panel
  historySearchQuery: string;
  historyRefreshTrigger: number;
  latestRequest: SavedRequest | null;
  
  // Dialogs
  isSettingsOpen: boolean;
  isWorkspaceDialogOpen: boolean;
  workspaceDialogMode: 'create' | 'rename' | 'delete';
  workspaceDialogTargetId: string | null;
  
  isClearHistoryDialogOpen: boolean;

  // Actions
  setHistorySearchQuery: (query: string) => void;
  refreshHistory: () => void;
  addLatestRequest: (request: SavedRequest) => void;
  clearLatestRequest: () => void;
  
  openSettings: () => void;
  closeSettings: () => void;
  
  openWorkspaceDialog: (mode: 'create' | 'rename' | 'delete', targetId?: string) => void;
  closeWorkspaceDialog: () => void;
  
  openClearHistoryDialog: () => void;
  closeClearHistoryDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  historySearchQuery: '',
  historyRefreshTrigger: 0,
  latestRequest: null,
  isSettingsOpen: false,
  isWorkspaceDialogOpen: false,
  workspaceDialogMode: 'create',
  workspaceDialogTargetId: null,
  isClearHistoryDialogOpen: false,

  setHistorySearchQuery: (query: string) => set({ historySearchQuery: query }),
  refreshHistory: () => set(state => ({ historyRefreshTrigger: state.historyRefreshTrigger + 1 })),
  addLatestRequest: (request: SavedRequest) => set({ latestRequest: request }),
  clearLatestRequest: () => set({ latestRequest: null }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  openWorkspaceDialog: (mode, targetId) =>
    set({
      isWorkspaceDialogOpen: true,
      workspaceDialogMode: mode,
      workspaceDialogTargetId: targetId ?? null,
    }),
  closeWorkspaceDialog: () =>
    set({
      isWorkspaceDialogOpen: false,
      workspaceDialogTargetId: null,
    }),

  openClearHistoryDialog: () => set({ isClearHistoryDialogOpen: true }),
  closeClearHistoryDialog: () => set({ isClearHistoryDialogOpen: false }),
}));
