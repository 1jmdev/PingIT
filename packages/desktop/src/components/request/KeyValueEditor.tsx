import { useCallback } from 'react';
import type { KeyValue } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  const handleAdd = useCallback(() => {
    onChange([...items, { key: '', value: '', enabled: true }]);
  }, [items, onChange]);

  const handleRemove = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  const handleChange = useCallback((index: number, field: 'key' | 'value', value: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }, [items, onChange]);

  const handleToggle = useCallback((index: number) => {
    onChange(items.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item)));
  }, [items, onChange]);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Checkbox
            checked={item.enabled}
            onCheckedChange={() => handleToggle(index)}
          />
          <Input
            value={item.key}
            onChange={(e) => handleChange(index, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 h-8 text-sm font-mono"
          />
          <Input
            value={item.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 h-8 text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs"
        onClick={handleAdd}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
}
