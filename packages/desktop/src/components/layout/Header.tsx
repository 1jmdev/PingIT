import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Settings, PanelLeft, Minus, Square, Copy, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useState, useEffect } from 'react';
import { TrafficLightButton } from '@/components/ui/traffic-light-button';

export function Header() {
  const { settings, toggleSidebar } = useSettingsStore();
  const { openSettings } = useUIStore();
  const appWindow = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);

  const isMac = window.navigator.userAgent.includes('Mac');

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    };
    checkMaximized();

    const unlisten = appWindow.onResized(() => {
      checkMaximized();
    });

    return () => {
      unlisten.then(fn => fn?.());
    };
  }, []);

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    await appWindow.close();
  };

  return (
    <header 
      className="flex items-center justify-between h-12 px-3 border-b border-border bg-background select-none"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2">
        {isMac && (
          <div className="flex items-center gap-1.5 mr-2">
            <TrafficLightButton type="close" onClick={handleClose} />
            <TrafficLightButton type="minimize" onClick={handleMinimize} />
            <TrafficLightButton type="maximize" onClick={handleMaximize} isMaximized={isMaximized} />
          </div>
        )}
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
        <span className="text-sm font-semibold" data-tauri-drag-region>PingIT</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={openSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
        {!isMac && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              onClick={handleMinimize}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              onClick={handleMaximize}
            >
              {isMaximized ? (
                <Copy className="h-3 w-3" />
              ) : (
                <Square className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
