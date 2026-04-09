"use client"

import { useEffect, useRef } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { Loader2 } from "lucide-react"
import { useEditorChat } from "@/editor-engine/components/chat-context"
import { ScreenplayBlockEditor } from "@/editor-engine/components/screenplay-block-editor"
import { getTextFromUIMessage } from "@/editor-engine/utils/ui-message-text"

export function PreviewPanel() {
  const { messages, status, busy } = useEditorChat()
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  const assistantMessages = messages.filter((m) => m.role === "assistant")
  const lastAssistant = assistantMessages.at(-1)
  const streamText = lastAssistant ? getTextFromUIMessage(lastAssistant) : ""
  const isStreamingAssistant = busy && lastAssistant && assistantMessages.length > 0

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status, busy, streamText])

  if (isStreamingAssistant) {
    return (
      <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-bg-primary">
        <div className="flex-1 min-h-0 overflow-auto px-4 py-8">
          {/* Página de streaming */}
          <div className="max-w-[680px] mx-auto">
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-accent uppercase tracking-widest">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generando guion…
            </div>
            <div
              className="bg-white dark:bg-[#1a1a1e] rounded-xl shadow-xl border border-gray-200/60 dark:border-white/8 px-10 py-10"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace", fontSize: "13px", lineHeight: 1.6 }}
            >
              <Streamdown plugins={{ code }} mode={undefined} isAnimating className="text-gray-900 dark:text-gray-100">
                {streamText}
              </Streamdown>
            </div>
          </div>
          <div ref={scrollAnchorRef} className="h-px" aria-hidden />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-[#f6f5f3] dark:bg-[#111114]">
      {/* Área de "página" centrada */}
      <div className="flex-1 min-h-0 overflow-auto py-8 px-4">
        <div className="max-w-[700px] mx-auto">
          {/* Hoja de guion */}
          <div className="bg-white dark:bg-[#1c1c21] rounded-xl shadow-lg border border-gray-200/60 dark:border-white/6 px-8 py-10 md:px-12 md:py-12 min-h-[500px]">
            <ScreenplayBlockEditor disabled={false} />
          </div>
        </div>
        <div ref={scrollAnchorRef} className="h-4" aria-hidden />
      </div>
    </div>
  )
}
