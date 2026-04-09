"use client"

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useUIStore } from "@/editor-engine/store/ui-store"
import { useIsMobile } from "@/hooks/use-mobile"

export type EditorLayoutProps = {
  /** Debe ser un solo elemento (p. ej. `<ChatPanel />`) para poder pasar `compact` en móvil. */
  chatSlot: ReactNode
  previewSlot: ReactNode
  modifiersSlot: ReactNode
}

function cloneChatSlot(chatSlot: ReactNode, compact: boolean): ReactNode {
  if (isValidElement(chatSlot)) {
    return cloneElement(chatSlot as ReactElement<{ compact?: boolean }>, {
      compact,
    })
  }
  return chatSlot
}

export function EditorLayout({
  chatSlot,
  previewSlot,
  modifiersSlot,
}: EditorLayoutProps) {
  const isMobile = useIsMobile()
  const chatOpen = useUIStore((s) => s.chatOpen)
  const modifiersOpen = useUIStore((s) => s.modifiersOpen)
  const setChatOpen = useUIStore((s) => s.setChatOpen)
  const setModifiersOpen = useUIStore((s) => s.setModifiersOpen)

  if (isMobile) {
    return (
      <>
        <div className="flex-1 flex flex-col min-h-0 min-w-0">{previewSlot}</div>

        <Sheet
          open={chatOpen}
          onOpenChange={(open) => {
            setChatOpen(open)
            if (open) setModifiersOpen(false)
          }}
        >
          <SheetContent
            side="left"
            showCloseButton
            className="flex flex-col gap-0 p-0 w-[min(100vw-1rem,22rem)] sm:max-w-md bg-bg-secondary border-accent-muted"
          >
            <SheetHeader className="px-4 py-3 border-b border-accent-muted shrink-0">
              <SheetTitle className="text-sm font-semibold text-text-primary text-left">
                Chat
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {cloneChatSlot(chatSlot, true)}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet
          open={modifiersOpen}
          onOpenChange={(open) => {
            setModifiersOpen(open)
            if (open) setChatOpen(false)
          }}
        >
          <SheetContent
            side="right"
            showCloseButton
            className="flex flex-col gap-0 p-0 w-[min(100vw-1rem,22rem)] sm:max-w-md bg-bg-secondary border-accent-muted"
          >
            <SheetHeader className="px-4 py-3 border-b border-accent-muted shrink-0">
              <SheetTitle className="text-sm font-semibold text-text-primary text-left">
                Modificadores
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {modifiersSlot}
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 min-h-0 w-full"
    >
      <ResizablePanel
        defaultSize={25}
        minSize={15}
        collapsible
        className="min-w-0 flex flex-col"
      >
        <div className="flex-1 min-h-0 flex flex-col border-r border-accent-muted overflow-hidden">
          {cloneChatSlot(chatSlot, false)}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="bg-accent-muted" />
      <ResizablePanel
        defaultSize={50}
        minSize={30}
        className="min-w-0 flex flex-col"
      >
        {previewSlot}
      </ResizablePanel>
      <ResizableHandle withHandle className="bg-accent-muted" />
      <ResizablePanel
        defaultSize={25}
        minSize={15}
        collapsible
        className="min-w-0 flex flex-col"
      >
        <div className="flex-1 min-h-0 flex flex-col border-l border-accent-muted overflow-hidden">
          {modifiersSlot}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
