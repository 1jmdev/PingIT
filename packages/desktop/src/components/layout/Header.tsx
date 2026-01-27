import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Settings, Moon, Sun, PanelLeft } from 'lucide-react';

export function Header() {
  const { settings, toggleTheme, toggleSidebar } = useSettingsStore();
  const { openSettings } = useUIStore();

  return (
    <header className="flex items-center justify-between h-12 px-3 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        {settings.sidebar_collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
        <span className="text-sm font-semibold">Postman</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
        >
          {settings.theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={openSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
