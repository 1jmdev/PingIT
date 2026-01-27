import { useState, memo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { JsonValue } from '@/lib/json';

interface JsonTreeViewerProps {
  data: JsonValue;
  initialExpanded?: boolean;
}

export function JsonTreeViewer({ data, initialExpanded = true }: JsonTreeViewerProps) {
  return (
    <div className="font-mono text-sm">
      <JsonNode data={data} depth={0} initialExpanded={initialExpanded} />
    </div>
  );
}

interface JsonNodeProps {
  data: JsonValue;
  depth: number;
  keyName?: string;
  initialExpanded?: boolean;
  isLast?: boolean;
}

const JsonNode = memo(function JsonNode({
  data,
  depth,
  keyName,
  initialExpanded = true,
  isLast = true,
}: JsonNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2 ? initialExpanded : false);

  const indent = depth * 16;
  const isObject = data !== null && typeof data === 'object' && !Array.isArray(data);
  const isArray = Array.isArray(data);

  if (data === null) {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className="text-purple-400">&quot;{keyName}&quot;</span>
        )}
        {keyName !== undefined && <span className="text-foreground">: </span>}
        <span className="text-orange-400">null</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className="text-purple-400">&quot;{keyName}&quot;</span>
        )}
        {keyName !== undefined && <span className="text-foreground">: </span>}
        <span className="text-blue-400">{data ? 'true' : 'false'}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (typeof data === 'number') {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className="text-purple-400">&quot;{keyName}&quot;</span>
        )}
        {keyName !== undefined && <span className="text-foreground">: </span>}
        <span className="text-cyan-400">{data}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (typeof data === 'string') {
    const isUrl = data.startsWith('http://') || data.startsWith('https://');
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <span className="text-purple-400">&quot;{keyName}&quot;</span>
        )}
        {keyName !== undefined && <span className="text-foreground">: </span>}
        <span className="text-green-400">
          &quot;
          {isUrl ? (
            <a href={data} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {data}
            </a>
          ) : (
            data.length > 200 ? data.slice(0, 200) + '...' : data
          )}
          &quot;
        </span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (isArray) {
    const items = data as JsonValue[];
    
    if (items.length === 0) {
      return (
        <div style={{ paddingLeft: indent }}>
          {keyName !== undefined && (
            <span className="text-purple-400">&quot;{keyName}&quot;</span>
          )}
          {keyName !== undefined && <span className="text-foreground">: </span>}
          <span className="text-foreground">[]</span>
          {!isLast && <span className="text-muted-foreground">,</span>}
        </div>
      );
    }

    return (
      <div>
        <div
          style={{ paddingLeft: indent }}
          className="cursor-pointer hover:bg-muted/50 rounded flex items-center"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
          {keyName !== undefined && (
            <span className="text-purple-400">&quot;{keyName}&quot;</span>
          )}
          {keyName !== undefined && <span className="text-foreground">: </span>}
          <span className="text-foreground">[</span>
          {!expanded && (
            <>
              <span className="text-muted-foreground ml-1">{items.length} items</span>
              <span className="text-foreground">]</span>
              {!isLast && <span className="text-muted-foreground">,</span>}
            </>
          )}
        </div>
        {expanded && (
          <>
            {items.map((item, index) => (
              <JsonNode
                key={index}
                data={item}
                depth={depth + 1}
                isLast={index === items.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span className="text-foreground">]</span>
              {!isLast && <span className="text-muted-foreground">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  if (isObject) {
    const entries = Object.entries(data as Record<string, JsonValue>);
    
    if (entries.length === 0) {
      return (
        <div style={{ paddingLeft: indent }}>
          {keyName !== undefined && (
            <span className="text-purple-400">&quot;{keyName}&quot;</span>
          )}
          {keyName !== undefined && <span className="text-foreground">: </span>}
          <span className="text-foreground">{'{}'}</span>
          {!isLast && <span className="text-muted-foreground">,</span>}
        </div>
      );
    }

    return (
      <div>
        <div
          style={{ paddingLeft: indent }}
          className="cursor-pointer hover:bg-muted/50 rounded flex items-center"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
          {keyName !== undefined && (
            <span className="text-purple-400">&quot;{keyName}&quot;</span>
          )}
          {keyName !== undefined && <span className="text-foreground">: </span>}
          <span className="text-foreground">{'{'}</span>
          {!expanded && (
            <>
              <span className="text-muted-foreground ml-1">{entries.length} keys</span>
              <span className="text-foreground">{'}'}</span>
              {!isLast && <span className="text-muted-foreground">,</span>}
            </>
          )}
        </div>
        {expanded && (
          <>
            {entries.map(([key, value], index) => (
              <JsonNode
                key={key}
                data={value}
                depth={depth + 1}
                keyName={key}
                isLast={index === entries.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span className="text-foreground">{'}'}</span>
              {!isLast && <span className="text-muted-foreground">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
});
