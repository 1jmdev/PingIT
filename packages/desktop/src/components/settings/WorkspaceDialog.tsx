import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

export function WorkspaceDialog() {
  const {
    isWorkspaceDialogOpen,
    workspaceDialogMode,
    workspaceDialogTargetId,
    closeWorkspaceDialog,
  } = useUIStore();
  
  const { workspaces, createWorkspace, updateWorkspace, deleteWorkspace } = useWorkspaceStore();
  
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetWorkspace = workspaceDialogTargetId
    ? workspaces.find(w => w.id === workspaceDialogTargetId)
    : null;

  useEffect(() => {
    if (isWorkspaceDialogOpen) {
      if (workspaceDialogMode === 'rename' && targetWorkspace) {
        setName(targetWorkspace.name);
      } else {
        setName('');
      }
      setError(null);
    }
  }, [isWorkspaceDialogOpen, workspaceDialogMode, targetWorkspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (workspaceDialogMode === 'delete') {
      await handleDelete();
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (workspaceDialogMode === 'create') {
        await createWorkspace(name.trim());
      } else if (workspaceDialogMode === 'rename' && workspaceDialogTargetId) {
        await updateWorkspace(workspaceDialogTargetId, name.trim());
      }
      closeWorkspaceDialog();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workspaceDialogTargetId) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteWorkspace(workspaceDialogTargetId);
      closeWorkspaceDialog();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (workspaceDialogMode) {
      case 'create':
        return 'Create Workspace';
      case 'rename':
        return 'Rename Workspace';
      case 'delete':
        return 'Delete Workspace';
    }
  };

  const getDescription = () => {
    switch (workspaceDialogMode) {
      case 'create':
        return 'Create a new workspace to organize your requests.';
      case 'rename':
        return 'Enter a new name for this workspace.';
      case 'delete':
        return 'This action cannot be undone. All requests and history in this workspace will be permanently deleted.';
    }
  };

  return (
    <Dialog open={isWorkspaceDialogOpen} onOpenChange={(open) => !open && closeWorkspaceDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {workspaceDialogMode === 'delete' ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Delete &quot;{targetWorkspace?.name}&quot;?</p>
                <p className="text-muted-foreground mt-1">
                  This will delete all requests and history in this workspace.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Name</Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Workspace"
                autoFocus
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={closeWorkspaceDialog}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={workspaceDialogMode === 'delete' ? 'destructive' : 'default'}
              disabled={isLoading}
            >
              {isLoading
                ? 'Loading...'
                : workspaceDialogMode === 'delete'
                ? 'Delete'
                : workspaceDialogMode === 'create'
                ? 'Create'
                : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
