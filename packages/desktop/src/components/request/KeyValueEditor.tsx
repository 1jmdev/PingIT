import { useCallback } from 'react';
import type { KeyValue } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  showDescription?: boolean;
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  showDescription = true,
}: KeyValueEditorProps) {
  const handleAdd = useCallback(() => {
    onChange([...items, { key: '', value: '', enabled: true, description: '' }]);
  }, [items, onChange]);

  const handleRemove = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  const handleChange = useCallback((index: number, field: keyof KeyValue, value: string | boolean) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }, [items, onChange]);

  const handleToggle = useCallback((index: number) => {
    onChange(items.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item)));
  }, [items, onChange]);

  // Auto-add a new row when the last row has content
  const handleKeyChange = useCallback((index: number, value: string) => {
    const newItems = items.map((item, i) => (i === index ? { ...item, key: value } : item));
    
    // If this is the last item and it now has a key, add a new empty row
    if (index === items.length - 1 && value && !items[index].key) {
      newItems.push({ key: '', value: '', enabled: true, description: '' });
    }
    
    onChange(newItems);
  }, [items, onChange]);

  // Ensure there's always at least one row
  const displayItems = items.length === 0 
    ? [{ key: '', value: '', enabled: true, description: '' }]
    : items;

  // If displayItems was created with default item, we need to handle it specially
  if (items.length === 0 && displayItems.length === 1) {
    // Add the initial item to the actual items
    onChange(displayItems);
    return null;
  }

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center gap-0 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
        <div className="w-10 shrink-0 px-2 py-2 flex items-center justify-center">
          {/* Checkbox header - empty */}
        </div>
        <div className="flex-1 min-w-0 px-2 py-2 border-l border-border">
          Key
        </div>
        <div className="flex-1 min-w-0 px-2 py-2 border-l border-border">
          Value
        </div>
        {showDescription && (
          <div className="flex-1 min-w-0 px-2 py-2 border-l border-border">
            Description
          </div>
        )}
        <div className="w-10 shrink-0 px-2 py-2 border-l border-border">
          {/* Delete header - empty */}
        </div>
      </div>

      {/* Data rows */}
      {displayItems.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "flex items-center gap-0 border-b border-border group hover:bg-muted/20 transition-colors",
            !item.enabled && "opacity-50"
          )}
        >
          <div className="w-10 shrink-0 px-2 py-1.5 flex items-center justify-center">
            <Checkbox
              checked={item.enabled}
              onCheckedChange={() => handleToggle(index)}
              className="h-4 w-4"
            />
          </div>
          <div className="flex-1 min-w-0 border-l border-border">
            <Input
              value={item.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
              placeholder={keyPlaceholder}
              className="h-8 text-sm font-mono border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/30"
            />
          </div>
          <div className="flex-1 min-w-0 border-l border-border">
            <Input
              value={item.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="h-8 text-sm border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/30"
            />
          </div>
          {showDescription && (
            <div className="flex-1 min-w-0 border-l border-border">
              <Input
                value={item.description || ''}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                placeholder="Description"
                className="h-8 text-sm text-muted-foreground border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/30"
              />
            </div>
          )}
          <div className="w-10 shrink-0 px-2 py-1.5 border-l border-border flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add row button - shown as a subtle clickable area */}
      <button
        type="button"
        onClick={handleAdd}
        className="w-full flex items-center gap-0 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors cursor-pointer"
      >
        <div className="w-10 shrink-0 px-2 py-2 flex items-center justify-center">
          {/* Empty checkbox space */}
        </div>
        <div className="flex-1 min-w-0 px-2 py-2 border-l border-border text-muted-foreground/50">
          {keyPlaceholder}
        </div>
        <div className="flex-1 min-w-0 px-2 py-2 border-l border-border text-muted-foreground/50">
          {valuePlaceholder}
        </div>
        {showDescription && (
          <div className="flex-1 min-w-0 px-2 py-2 border-l border-border text-muted-foreground/50">
            Description
          </div>
        )}
        <div className="w-10 shrink-0 px-2 py-2 border-l border-border">
          {/* Empty delete space */}
        </div>
      </button>
    </div>
  );
}
