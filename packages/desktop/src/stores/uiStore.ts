import { create } from 'zustand';

interface UIState {
  // History panel
  historySearchQuery: string;
  historyRefreshTrigger: number;
  
  // Dialogs
  isSettingsOpen: boolean;
  isWorkspaceDialogOpen: boolean;
  workspaceDialogMode: 'create' | 'rename' | 'delete';
  workspaceDialogTargetId: string | null;
  
  isClearHistoryDialogOpen: boolean;

  // Actions
  setHistorySearchQuery: (query: string) => void;
  refreshHistory: () => void;
  
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
  isSettingsOpen: false,
  isWorkspaceDialogOpen: false,
  workspaceDialogMode: 'create',
  workspaceDialogTargetId: null,
  isClearHistoryDialogOpen: false,

  setHistorySearchQuery: (query: string) => set({ historySearchQuery: query }),
  refreshHistory: () => set(state => ({ historyRefreshTrigger: state.historyRefreshTrigger + 1 })),

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
