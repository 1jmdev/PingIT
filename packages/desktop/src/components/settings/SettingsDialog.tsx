import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

export function SettingsDialog() {
  const { isSettingsOpen, closeSettings } = useUIStore();
  const { settings, toggleTheme } = useSettingsStore();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Keyboard shortcuts info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Send request</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                  Ctrl + Enter
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">New tab</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                  Ctrl + T
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Close tab</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                  Ctrl + W
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Toggle sidebar</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                  Ctrl + B
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
