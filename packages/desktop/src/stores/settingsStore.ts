import { create } from 'zustand';
import type { AppSettings } from '@/types';
import * as api from '@/lib/tauri';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  toggleTheme: () => Promise<void>;
  setSidebarCollapsed: (collapsed: boolean) => Promise<void>;
  toggleSidebar: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  sidebar_collapsed: false,
  active_workspace_id: null,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

  loadSettings: async () => {
    try {
      set({ isLoading: true });
      const settings = await api.getAllSettings();
      set({
        settings: {
          theme: settings.theme as 'light' | 'dark',
          sidebar_collapsed: settings.sidebar_collapsed,
          active_workspace_id: settings.active_workspace_id,
        },
        isLoading: false,
      });

      // Apply theme to document
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    } catch (e) {
      console.error('Failed to load settings:', e);
      set({ isLoading: false });
    }
  },

  setTheme: async (theme: 'light' | 'dark') => {
    await api.setSetting('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set(state => ({
      settings: { ...state.settings, theme },
    }));
  },

  toggleTheme: async () => {
    const { settings } = get();
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    await get().setTheme(newTheme);
  },

  setSidebarCollapsed: async (collapsed: boolean) => {
    await api.setSetting('sidebar_collapsed', String(collapsed));
    set(state => ({
      settings: { ...state.settings, sidebar_collapsed: collapsed },
    }));
  },

  toggleSidebar: async () => {
    const { settings } = get();
    await get().setSidebarCollapsed(!settings.sidebar_collapsed);
  },
}));
