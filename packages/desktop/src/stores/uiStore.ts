import { create } from 'zustand';

interface UIState {
  // History panel
  historySearchQuery: string;
  
  // Dialogs
  isSettingsOpen: boolean;
  isWorkspaceDialogOpen: boolean;
  workspaceDialogMode: 'create' | 'rename' | 'delete';
  workspaceDialogTargetId: string | null;
  
  isClearHistoryDialogOpen: boolean;

  // Actions
  setHistorySearchQuery: (query: string) => void;
  
  openSettings: () => void;
  closeSettings: () => void;
  
  openWorkspaceDialog: (mode: 'create' | 'rename' | 'delete', targetId?: string) => void;
  closeWorkspaceDialog: () => void;
  
  openClearHistoryDialog: () => void;
  closeClearHistoryDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  historySearchQuery: '',
  isSettingsOpen: false,
  isWorkspaceDialogOpen: false,
  workspaceDialogMode: 'create',
  workspaceDialogTargetId: null,
  isClearHistoryDialogOpen: false,

  setHistorySearchQuery: (query: string) => set({ historySearchQuery: query }),

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
