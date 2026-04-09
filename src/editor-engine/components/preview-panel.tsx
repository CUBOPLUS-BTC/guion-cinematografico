"use client"

import { useEffect, useRef } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { useEditorChat } from "@/editor-engine/components/chat-context"
import { getTextFromUIMessage } from "@/editor-engine/utils/ui-message-text"

/** Vista central: respuestas del asistente renderizadas con Streamdown (páginas de guion). */
export function PreviewPanel() {
  const { messages, status, busy } = useEditorChat()
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status])

  const hasAssistantReply = messages.some((m) => m.role === "assistant")

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-bg-primary">
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto space-y-6">
          {!hasAssistantReply && (
            <p className="text-sm text-text-muted text-center italic py-8">
              Las respuestas de la IA aparecerán aquí como páginas con formato legible.
            </p>
          )}
          {messages.map((m, idx) => {
            if (m.role !== "assistant") return null
            const isLast = idx === messages.length - 1
            const isStreamingAssistant = busy && isLast
            const text = getTextFromUIMessage(m)

            return (
              <div key={m.id} className="flex justify-start w-full">
                <div
                  className="w-full max-w-full rounded-md bg-bg-canvas text-zinc-900 shadow-lg border border-zinc-200/80 px-6 py-8 md:px-10 md:py-10"
                  style={{
                    fontFamily: "var(--font-screenplay), Courier New, monospace",
                    fontSize: "12pt",
                    lineHeight: 1.05,
                  }}
                >
                  <Streamdown
                    plugins={{ code }}
                    mode={isStreamingAssistant ? undefined : "static"}
                    isAnimating={isStreamingAssistant}
                    className="screenplay-streamdown text-zinc-900 [&_pre]:bg-zinc-100 [&_code]:text-zinc-800"
                  >
                    {text}
                  </Streamdown>
                </div>
              </div>
            )
          })}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-accent px-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando…
            </div>
          )}
          <div ref={scrollAnchorRef} className="h-px" aria-hidden />
        </div>
      </ScrollArea>
    </div>
  )
}
