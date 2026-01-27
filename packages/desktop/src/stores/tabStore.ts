import { create } from 'zustand';
import type { Tab, TabState, HttpMethod, ResponseData } from '@/types';
import * as api from '@/lib/tauri';
import { MAX_TABS_IN_MEMORY } from '@/lib/constants';

interface TabStore {
  tabs: Tab[];
  activeTabId: string | null;
  isLoading: boolean;
  
  // Response data per tab (transient, not persisted)
  responses: Record<string, ResponseData | null>;
  loadingTabs: Set<string>;

  // Actions
  loadTabs: (workspaceId: string) => Promise<void>;
  createTab: (workspaceId: string) => Promise<Tab>;
  closeTab: (tabId: string) => Promise<void>;
  setActiveTab: (workspaceId: string, tabId: string) => Promise<void>;
  updateTabState: (tabId: string, updates: Partial<TabState>) => void;
  markDirty: (tabId: string) => void;
  markClean: (tabId: string) => void;
  persistTab: (tabId: string) => Promise<void>;
  
  // Response management
  setResponse: (tabId: string, response: ResponseData | null) => void;
  setTabLoading: (tabId: string, loading: boolean) => void;
  
  // Open request from history
  openRequest: (workspaceId: string, request: {
    method: HttpMethod;
    url: string;
    params: Array<{ key: string; value: string; enabled: boolean }> | null;
    headers: Array<{ key: string; value: string; enabled: boolean }> | null;
    body_type: string | null;
    body_content: string | null;
  }) => Promise<Tab>;
}

const defaultTabState: TabState = {
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body_type: 'none',
  body_content: '',
  is_dirty: false,
};

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  isLoading: true,
  responses: {},
  loadingTabs: new Set(),

  loadTabs: async (workspaceId: string) => {
    try {
      set({ isLoading: true });
      let tabs = await api.getTabsByWorkspace(workspaceId);
      
      // If no tabs, create a default one
      if (tabs.length === 0) {
        const newTab = await api.createTab(workspaceId, defaultTabState);
        tabs = [newTab];
      }

      // Only keep MAX_TABS_IN_MEMORY tabs loaded, rest will be lazy loaded
      const loadedTabs = tabs.slice(0, MAX_TABS_IN_MEMORY);
      const activeTab = loadedTabs.find(t => t.is_active) ?? loadedTabs[0];

      set({
        tabs: loadedTabs,
        activeTabId: activeTab?.id ?? null,
        isLoading: false,
        responses: {},
        loadingTabs: new Set(),
      });
    } catch (e) {
      console.error('Failed to load tabs:', e);
      set({ isLoading: false });
    }
  },

  createTab: async (workspaceId: string) => {
    const newTab = await api.createTab(workspaceId, defaultTabState);
    
    set(state => {
      let tabs = [...state.tabs, newTab];
      
      // Enforce memory limit - remove oldest inactive tabs
      if (tabs.length > MAX_TABS_IN_MEMORY) {
        const activeTabs = tabs.filter(t => t.id === newTab.id || t.is_active);
        const inactiveTabs = tabs.filter(t => t.id !== newTab.id && !t.is_active);
        tabs = [...activeTabs, ...inactiveTabs.slice(-(MAX_TABS_IN_MEMORY - activeTabs.length))];
      }
      
      return {
        tabs,
        activeTabId: newTab.id,
      };
    });
    
    return newTab;
  },

  closeTab: async (tabId: string) => {
    const { tabs, activeTabId } = get();
    
    if (tabs.length <= 1) {
      // Don't close the last tab, just reset it
      set(state => ({
        tabs: state.tabs.map(t =>
          t.id === tabId ? { ...t, state: defaultTabState } : t
        ),
      }));
      return;
    }

    const nextActiveId = await api.deleteTab(tabId);
    
    set(state => ({
      tabs: state.tabs.filter(t => t.id !== tabId),
      activeTabId: activeTabId === tabId ? (nextActiveId ?? state.tabs[0]?.id ?? null) : activeTabId,
      responses: { ...state.responses, [tabId]: null },
    }));
  },

  setActiveTab: async (workspaceId: string, tabId: string) => {
    await api.setActiveTab(workspaceId, tabId);
    set({ activeTabId: tabId });
  },

  updateTabState: (tabId: string, updates: Partial<TabState>) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.id === tabId
          ? { ...t, state: { ...t.state, ...updates, is_dirty: true } }
          : t
      ),
    }));
  },

  markDirty: (tabId: string) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.id === tabId ? { ...t, state: { ...t.state, is_dirty: true } } : t
      ),
    }));
  },

  markClean: (tabId: string) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.id === tabId ? { ...t, state: { ...t.state, is_dirty: false } } : t
      ),
    }));
  },

  persistTab: async (tabId: string) => {
    const tab = get().tabs.find(t => t.id === tabId);
    if (tab) {
      await api.updateTab(tabId, tab.state, tab.request_id ?? undefined);
    }
  },

  setResponse: (tabId: string, response: ResponseData | null) => {
    set(state => ({
      responses: { ...state.responses, [tabId]: response },
    }));
  },

  setTabLoading: (tabId: string, loading: boolean) => {
    set(state => {
      const newLoading = new Set(state.loadingTabs);
      if (loading) {
        newLoading.add(tabId);
      } else {
        newLoading.delete(tabId);
      }
      return { loadingTabs: newLoading };
    });
  },

  openRequest: async (workspaceId: string, request) => {
    const state: TabState = {
      method: request.method,
      url: request.url,
      params: request.params ?? [],
      headers: request.headers ?? [],
      body_type: (request.body_type as TabState['body_type']) ?? 'none',
      body_content: request.body_content ?? '',
      is_dirty: false,
    };

    const newTab = await api.createTab(workspaceId, state);
    
    set(state => ({
      tabs: [...state.tabs, newTab].slice(-MAX_TABS_IN_MEMORY),
      activeTabId: newTab.id,
    }));

    return newTab;
  },
}));
