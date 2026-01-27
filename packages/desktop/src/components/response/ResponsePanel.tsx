import { useMemo, useState } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getStatusColor } from '@/lib/constants';
import { formatBytes, formatDuration, parseJsonSafe } from '@/lib/json';
import { Loader2, Copy, Check } from 'lucide-react';
import { JsonTreeViewer } from './JsonTreeViewer';

export function ResponsePanel() {
  const { activeTabId, responses, loadingTabs } = useTabStore();
  
  const response = activeTabId ? responses[activeTabId] : null;
  const isLoading = activeTabId ? loadingTabs.has(activeTabId) : false;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (response?.body) {
      await navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parsedBody = useMemo(() => {
    if (!response?.body) return null;
    return parseJsonSafe(response.body);
  }, [response?.body]);

  const isJson = parsedBody !== undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">Sending request...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <span className="text-sm">Send a request to see the response</span>
      </div>
    );
  }

  const isError = response.status === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/30">
        {isError ? (
          <span className="text-destructive font-medium">Error</span>
        ) : (
          <span className={cn('px-2 py-0.5 rounded text-sm font-medium', getStatusColor(response.status))}>
            {response.status} {response.status_text}
          </span>
        )}
        
        {!isError && (
          <>
            <span className="text-xs text-muted-foreground">
              {formatDuration(response.time_ms)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatBytes(response.size_bytes)}
            </span>
          </>
        )}

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleCopy}
          disabled={!response.body}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Response content */}
      <Tabs defaultValue="body" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-2 w-fit">
          <TabsTrigger value="body" className="text-xs">
            Body
          </TabsTrigger>
          <TabsTrigger value="headers" className="text-xs">
            Headers {response.headers.length > 0 && (
              <span className="ml-1 text-muted-foreground">({response.headers.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="flex-1 overflow-hidden m-0">
          {isError ? (
            <div className="p-4 text-destructive text-sm whitespace-pre-wrap">
              {response.body || 'Request failed'}
            </div>
          ) : isJson && parsedBody !== undefined ? (
            <ScrollArea className="h-full">
              <div className="p-4">
                <JsonTreeViewer data={parsedBody} />
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full">
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
                {response.body}
              </pre>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {response.headers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No headers</div>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {response.headers.map((header, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-1.5 pr-4 font-mono text-muted-foreground whitespace-nowrap">
                          {header.key}
                        </td>
                        <td className="py-1.5 font-mono break-all">
                          {header.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
