"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/editor-engine/store/chat-store"
import { useEditorStore } from "@/editor-engine/store/editor-store"
import { usePluginStore } from "@/editor-engine/store/plugin-store"
import type { ChatDocumentAction } from "@/lib/core/ai/chat-document"
import {
  Loader2,
  Send,
  Sparkles,
  Type,
  Wand2,
  Repeat,
} from "lucide-react"

function getTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

const ACTION_HINTS: Record<Exclude<ChatDocumentAction, "chat">, string> = {
  generate:
    "Genera una escena nueva completa en formato Fountain, coherente con el documento actual.",
  continue: "Continúa el guion desde el final en Fountain, sin repetir lo ya escrito.",
  refine:
    "Refina y pule el guion completo para que sea más cinematográfico, manteniendo Fountain.",
  rewrite:
    "Reescribe el guion aplicando un tono más claro y visual, en Fountain.",
}

export type ChatPanelProps = {
  projectId: string
  initialMessages: UIMessage[]
}

/** Chat principal: mensajes con guion renderizado en Streamdown (vista “página”). */
export function ChatPanel({ projectId, initialMessages }: ChatPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const setPendingAction = useChatStore((s) => s.setPendingAction)
  const documentFountain = useChatStore((s) => s.documentFountain)
  const updateStatsFromFountain = useEditorStore((s) => s.updateStatsFromFountain)

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `/api/projects/${projectId}/chat`,
        credentials: "include",
        prepareSendMessagesRequest: async ({ body, messages }) => ({
          body: {
            ...(body ?? {}),
            messages,
            documentFountain: useChatStore.getState().documentFountain,
            modifiers: { technical: usePluginStore.getState().getAIModifiers() },
            model: "anthropic/claude-3-haiku",
            action: useChatStore.getState().pendingAction,
          },
        }),
      }),
    [projectId]
  )

  const { messages, sendMessage, status, stop } = useChat({
    id: `project-chat-${projectId}`,
    messages: initialMessages,
    transport,
    onFinish: ({ message }) => {
      const text = getTextFromUIMessage(message)
      const action = useChatStore.getState().pendingAction
      useChatStore.getState().applyAssistantOutput(text, action)
      useChatStore.getState().setPendingAction("chat")
    },
  })

  useEffect(() => {
    updateStatsFromFountain(documentFountain)
  }, [documentFountain, updateStatsFromFountain])

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status])

  const busy = status === "streaming" || status === "submitted"

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const text = inputRef.current?.value?.trim()
      if (!text || busy) return
      setPendingAction("chat")
      inputRef.current!.value = ""
      await sendMessage({ text })
    },
    [busy, sendMessage, setPendingAction]
  )

  const runQuickAction = useCallback(
    async (action: Exclude<ChatDocumentAction, "chat">) => {
      if (busy) return
      setPendingAction(action)
      await sendMessage({ text: ACTION_HINTS[action] })
    },
    [busy, sendMessage, setPendingAction]
  )

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-bg-primary">
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <p className="text-sm text-text-muted text-center italic py-8">
              Escribe una instrucción o usa una acción rápida debajo para generar
              tu guion. Las respuestas aparecen como páginas con formato legible.
            </p>
          )}
          {messages.map((m, idx) => {
            const isLast = idx === messages.length - 1
            const isStreamingAssistant =
              busy && m.role === "assistant" && isLast
            const text = getTextFromUIMessage(m)

            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-bg-tertiary border border-accent-muted px-4 py-2.5 text-sm text-text-primary shadow-sm">
                    <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                  </div>
                </div>
              )
            }

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

      <div className="shrink-0 border-t border-accent-muted bg-bg-secondary">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[10px] gap-1 border-accent-muted"
              disabled={busy}
              onClick={() => void runQuickAction("generate")}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              Generar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[10px] gap-1 border-accent-muted"
              disabled={busy}
              onClick={() => void runQuickAction("continue")}
            >
              <Wand2 className="h-3 w-3 text-blue-500" />
              Continuar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[10px] gap-1 border-accent-muted"
              disabled={busy}
              onClick={() => void runQuickAction("refine")}
            >
              <Type className="h-3 w-3 text-green-500" />
              Refinar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[10px] gap-1 border-accent-muted"
              disabled={busy}
              onClick={() => void runQuickAction("rewrite")}
            >
              <Repeat className="h-3 w-3 text-purple-500" />
              Reescribir
            </Button>
          </div>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-2"
          >
            <textarea
              ref={inputRef}
              placeholder="Instrucción para la IA…"
              className="w-full min-h-[80px] rounded-lg border border-accent-muted bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-y"
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void onSubmit(e as unknown as React.FormEvent)
                }
              }}
            />
            <div className="flex items-center justify-between gap-2">
              {busy ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => void stop()}
                >
                  Detener
                </Button>
              ) : (
                <span className="text-[10px] text-text-muted">
                  Enter envía · Shift+Enter nueva línea
                </span>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={busy}
                className="gap-2 bg-accent text-white"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
