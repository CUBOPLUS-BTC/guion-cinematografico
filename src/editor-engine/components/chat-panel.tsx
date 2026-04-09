"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore } from "@/editor-engine/store/chat-store"
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

export function ChatPanel({ projectId, initialMessages }: ChatPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const setPendingAction = useChatStore((s) => s.setPendingAction)
  const setStreamingPreview = useChatStore((s) => s.setStreamingPreview)

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
      setStreamingPreview(null)
    },
  })

  useEffect(() => {
    if (status !== "streaming") {
      setStreamingPreview(null)
      return
    }
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant")
    if (!lastAssistant) {
      setStreamingPreview(null)
      return
    }
    setStreamingPreview(getTextFromUIMessage(lastAssistant))
  }, [messages, status, setStreamingPreview])

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
    <div className="flex flex-col h-full min-w-0 bg-bg-secondary border-r border-accent-muted">
      <div className="p-3 border-b border-accent-muted shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-accent">
          IA — Chat
        </h3>
        <p className="text-[10px] text-text-muted mt-1 leading-snug">
          Pide cambios al guion; el texto central se actualiza con la respuesta.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[10px] gap-1 border-accent-muted"
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
            className="h-7 text-[10px] gap-1 border-accent-muted"
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
            className="h-7 text-[10px] gap-1 border-accent-muted"
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
            className="h-7 text-[10px] gap-1 border-accent-muted"
            disabled={busy}
            onClick={() => void runQuickAction("rewrite")}
          >
            <Repeat className="h-3 w-3 text-purple-500" />
            Reescribir
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {messages.length === 0 && (
            <p className="text-xs text-text-muted italic">
              Escribe una instrucción o usa una acción rápida.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-4 rounded-lg bg-bg-tertiary border border-accent-muted px-3 py-2 text-sm text-text-primary"
                  : "mr-4 rounded-lg bg-bg-primary border border-accent-muted px-3 py-2 text-sm text-text-primary"
              }
            >
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap">{getTextFromUIMessage(m)}</p>
              ) : (
                <Streamdown
                  plugins={{ code }}
                  className="text-sm [&_pre]:bg-zinc-900/80 [&_code]:text-zinc-100"
                  isAnimating={busy && m.id === messages[messages.length - 1]?.id}
                >
                  {getTextFromUIMessage(m)}
                </Streamdown>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-accent px-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando…
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="p-3 border-t border-accent-muted bg-bg-tertiary space-y-2 shrink-0"
      >
        <Textarea
          ref={inputRef}
          placeholder="Instrucción para la IA…"
          className="min-h-[72px] text-sm bg-bg-secondary border-accent-muted resize-y"
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
            <span className="text-[10px] text-text-muted">Enter envía · Shift+Enter línea</span>
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
  )
}
