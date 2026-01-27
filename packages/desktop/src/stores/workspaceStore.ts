import { create } from 'zustand';
import type { Workspace } from '@/types';
import * as api from '@/lib/tauri';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadWorkspaces: () => Promise<void>;
  setActiveWorkspace: (id: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: true,
  error: null,

  loadWorkspaces: async () => {
    try {
      set({ isLoading: true, error: null });
      const workspaces = await api.getAllWorkspaces();
      const settings = await api.getAllSettings();
      
      let activeId = settings.active_workspace_id;
      
      // If no active workspace or it doesn't exist, use the first one
      if (!activeId || !workspaces.find(w => w.id === activeId)) {
        activeId = workspaces[0]?.id ?? null;
        if (activeId) {
          await api.setSetting('active_workspace_id', activeId);
        }
      }

      set({
        workspaces,
        activeWorkspaceId: activeId,
        isLoading: false,
      });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  setActiveWorkspace: async (id: string) => {
    try {
      await api.setSetting('active_workspace_id', id);
      set({ activeWorkspaceId: id });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  createWorkspace: async (name: string) => {
    const workspace = await api.createWorkspace(name);
    set(state => ({
      workspaces: [...state.workspaces, workspace],
    }));
    return workspace;
  },

  updateWorkspace: async (id: string, name: string) => {
    const updated = await api.updateWorkspace(id, name);
    set(state => ({
      workspaces: state.workspaces.map(w => (w.id === id ? updated : w)),
    }));
  },

  deleteWorkspace: async (id: string) => {
    const { workspaces, activeWorkspaceId } = get();
    
    if (workspaces.length <= 1) {
      throw new Error('Cannot delete the last workspace');
    }

    await api.deleteWorkspace(id);

    const remaining = workspaces.filter(w => w.id !== id);
    let newActiveId = activeWorkspaceId;

    if (activeWorkspaceId === id) {
      newActiveId = remaining[0]?.id ?? null;
      if (newActiveId) {
        await api.setSetting('active_workspace_id', newActiveId);
      }
    }

    set({
      workspaces: remaining,
      activeWorkspaceId: newActiveId,
    });
  },
}));
