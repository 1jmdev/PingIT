import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import * as api from '@/lib/tauri';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ClearHistoryDialog() {
  const { isClearHistoryDialogOpen, closeClearHistoryDialog } = useUIStore();
  const { activeWorkspaceId, workspaces } = useWorkspaceStore();
  
  const [isLoading, setIsLoading] = useState(false);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  const handleClear = async () => {
    if (!activeWorkspaceId) return;

    setIsLoading(true);

    try {
      await api.clearWorkspaceHistory(activeWorkspaceId);
      closeClearHistoryDialog();
      // Refresh the page to reload history
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isClearHistoryDialogOpen} onOpenChange={(open) => !open && closeClearHistoryDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear History</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All request history will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="text-sm">
            <p className="font-medium">
              Clear all history in &quot;{activeWorkspace?.name}&quot;?
            </p>
            <p className="text-muted-foreground mt-1">
              This will permanently delete all saved requests and responses.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeClearHistoryDialog}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={isLoading}
          >
            {isLoading ? 'Clearing...' : 'Clear History'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
