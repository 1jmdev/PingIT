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
  duplicateTab: (workspaceId: string, tabId: string) => Promise<Tab>;
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
    id?: string;
    method: HttpMethod;
    url: string;
    params: Array<{ key: string; value: string; enabled: boolean }> | null;
    headers: Array<{ key: string; value: string; enabled: boolean }> | null;
    body_type: string | null;
    body_content: string | null;
  }, response?: ResponseData | null) => Promise<Tab>;
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

  duplicateTab: async (workspaceId: string, tabId: string) => {
    const { tabs } = get();
    const sourceTab = tabs.find(t => t.id === tabId);
    
    if (!sourceTab) {
      throw new Error('Source tab not found');
    }
    
    // Create a new tab with the duplicated state without response
    const newTab = await api.createTab(workspaceId, {
      ...sourceTab.state,
      is_dirty: false,
    });
    
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

    await api.updateTab(newTab.id, sourceTab.state, sourceTab.request_id ?? undefined);
    
    return newTab;
  },

  closeTab: async (tabId: string) => {
    const { tabs, activeTabId } = get();
    
    const nextActiveId = await api.deleteTab(tabId);
    const remainingTabs = tabs.filter(t => t.id !== tabId);
    
    set(state => ({
      tabs: remainingTabs,
      activeTabId: activeTabId === tabId 
        ? (nextActiveId ?? remainingTabs[0]?.id ?? null) 
        : activeTabId,
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

  openRequest: async (workspaceId: string, request, response?) => {
    // If an ID is provided, check if tab with that request_id already exists in database
    if (request.id) {
      try {
        const allTabs = await api.getTabsByWorkspace(workspaceId);
        const existingTab = allTabs.find(tab => tab.request_id === request.id);

        if (existingTab) {
          // Tab exists, activate it instead of creating a new one
          await api.setActiveTab(workspaceId, existingTab.id);

          // If the tab is not in memory, load it
          const { tabs } = get();
          const tabInMemory = tabs.find(tab => tab.id === existingTab.id);

          if (!tabInMemory) {
            // Add the tab to memory and enforce memory limit
            set(state => {
              let newTabs = [...state.tabs, existingTab];

              // Enforce memory limit - remove oldest inactive tabs
              if (newTabs.length > MAX_TABS_IN_MEMORY) {
                const activeTabs = newTabs.filter(t => t.id === existingTab.id || t.is_active);
                const inactiveTabs = newTabs.filter(t => t.id !== existingTab.id && !t.is_active);
                newTabs = [...activeTabs, ...inactiveTabs.slice(-(MAX_TABS_IN_MEMORY - activeTabs.length))];
              }

              return {
                tabs: newTabs,
                activeTabId: existingTab.id,
              };
            });
          } else {
            // Tab is already in memory, just set it as active
            set({ activeTabId: existingTab.id });
          }

          // Update response data if provided
          if (response) {
            set(state => ({
              responses: { ...state.responses, [existingTab.id]: response }
            }));
          }

          return existingTab;
        }
      } catch (e) {
        console.error('Failed to check existing tab:', e);
        // Continue with creating new tab if check fails
      }
    }

    // Create new tab if no ID provided or tab doesn't exist
    const tabState: TabState = {
      method: request.method,
      url: request.url,
      params: request.params ?? [],
      headers: request.headers ?? [],
      body_type: (request.body_type as TabState['body_type']) ?? 'none',
      body_content: request.body_content ?? '',
      is_dirty: false,
    };

    const newTab = await api.createTab(workspaceId, tabState);

    // If we have a request ID, associate the tab with the saved request
    if (request.id) {
      await api.updateTab(newTab.id, newTab.state, request.id);
      newTab.request_id = request.id;
    }

    set(state => ({
      tabs: [...state.tabs, newTab].slice(-MAX_TABS_IN_MEMORY),
      activeTabId: newTab.id,
      // If response data is provided, store it
      responses: response ? { ...state.responses, [newTab.id]: response } : state.responses,
    }));

    return newTab;
  },
}));
