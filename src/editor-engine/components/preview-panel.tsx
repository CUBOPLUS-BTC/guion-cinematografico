"use client"

import { useEffect, useRef } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { Loader2 } from "lucide-react"
import { useEditorChat } from "@/editor-engine/components/chat-context"
import { ScreenplayBlockEditor } from "@/editor-engine/components/screenplay-block-editor"
import { getTextFromUIMessage } from "@/editor-engine/utils/ui-message-text"

/** Vista central: streaming con Streamdown mientras genera; luego editor de bloques del guion Fountain. */
export function PreviewPanel() {
  const { messages, status, busy } = useEditorChat()
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  const assistantMessages = messages.filter((m) => m.role === "assistant")
  const lastAssistant = assistantMessages.at(-1)
  const streamText = lastAssistant ? getTextFromUIMessage(lastAssistant) : ""
  const isStreamingAssistant =
    busy && lastAssistant && assistantMessages.length > 0

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status, busy, streamText])

  if (isStreamingAssistant) {
    return (
      <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-bg-primary">
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Generando guion…
            </p>
            <div
              className="w-full max-w-full rounded-md bg-bg-canvas text-zinc-900 dark:text-text-primary shadow-lg border border-zinc-200/80 dark:border-accent-muted px-6 py-8 md:px-10 md:py-10"
              style={{
                fontFamily: "var(--font-screenplay), Courier New, monospace",
                fontSize: "12pt",
                lineHeight: 1.05,
              }}
            >
              <Streamdown
                plugins={{ code }}
                mode={undefined}
                isAnimating
                className="screenplay-streamdown text-zinc-900 dark:text-text-primary [&_pre]:bg-zinc-100 dark:[&_pre]:bg-bg-tertiary [&_code]:text-zinc-800 dark:[&_code]:text-text-secondary"
              >
                {streamText}
              </Streamdown>
            </div>
            <div className="flex items-center gap-2 text-xs text-accent px-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando…
            </div>
            <div ref={scrollAnchorRef} className="h-px" aria-hidden />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-bg-primary">
      <ScreenplayBlockEditor disabled={false} />
      <div ref={scrollAnchorRef} className="h-px shrink-0" aria-hidden />
    </div>
  )
}
