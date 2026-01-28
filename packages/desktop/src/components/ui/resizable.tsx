import * as React from "react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border hover:bg-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500 relative flex w-full h-0.5 items-center justify-center cursor-row-resize focus-visible:outline-none transition-colors data-[resizable-panels-group-dragging]:bg-blue-500",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border hover:bg-blue-500 h-6 w-1 rounded-sm z-10 flex shrink-0 transition-colors data-[resizable-panels-group-dragging]:bg-blue-500" />
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
