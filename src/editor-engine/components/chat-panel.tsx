"use client"

import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditorChat } from "@/editor-engine/components/chat-context"
import { getTextFromUIMessage } from "@/editor-engine/utils/ui-message-text"
import {
  Loader2,
  Send,
  Sparkles,
  Type,
  Wand2,
  Repeat,
} from "lucide-react"

export type ChatPanelProps = {
  /** When true, used inside a narrow column (e.g. mobile sheet) — tighter padding. */
  compact?: boolean
}

/** Panel de prompting: mensajes del usuario, acciones rápidas y formulario. */
export function ChatPanel({ compact }: ChatPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const { messages, busy, runQuickAction, submitChat, stop } = useEditorChat()

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const text = inputRef.current?.value?.trim()
      if (!text || busy) return
      inputRef.current!.value = ""
      await submitChat(text)
    },
    [busy, submitChat]
  )

  const padX = compact ? "px-3" : "px-4 md:px-6"
  const maxW = compact ? "max-w-none" : "max-w-xl mx-auto"

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-bg-primary">
      <ScrollArea className="flex-1 min-h-0">
        <div className={`${padX} py-4 ${maxW} space-y-4`}>
          {messages.length === 0 && (
            <p className="text-sm text-text-muted text-center italic py-6">
              Escribe una instrucción o usa una acción rápida abajo para generar tu guion.
            </p>
          )}
          {messages.map((m) => {
            if (m.role !== "user") return null
            const text = getTextFromUIMessage(m)
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[95%] rounded-2xl rounded-br-md bg-bg-tertiary border border-accent-muted px-4 py-2.5 text-sm text-text-primary shadow-sm">
                  <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                </div>
              </div>
            )
          })}
          <div ref={scrollAnchorRef} className="h-px" aria-hidden />
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t border-accent-muted bg-bg-secondary">
        <div className={`${padX} py-3 space-y-3 ${maxW}`}>
          <div className="flex flex-wrap gap-1.5">
            <QuickActionButton
              busy={busy}
              onClick={() => void runQuickAction("generate")}
              icon={<Sparkles className="h-3 w-3 text-amber-500" />}
              label="Generar"
            />
            <QuickActionButton
              busy={busy}
              onClick={() => void runQuickAction("continue")}
              icon={<Wand2 className="h-3 w-3 text-blue-500" />}
              label="Continuar"
            />
            <QuickActionButton
              busy={busy}
              onClick={() => void runQuickAction("refine")}
              icon={<Type className="h-3 w-3 text-green-500" />}
              label="Refinar"
            />
            <QuickActionButton
              busy={busy}
              onClick={() => void runQuickAction("rewrite")}
              icon={<Repeat className="h-3 w-3 text-purple-500" />}
              label="Reescribir"
            />
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-2">
            <textarea
              ref={inputRef}
              placeholder="Instrucción para la IA…"
              className="w-full min-h-[72px] md:min-h-[80px] rounded-lg border border-accent-muted bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-y"
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

function QuickActionButton({
  busy,
  onClick,
  icon,
  label,
}: {
  busy: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 text-[10px] gap-1 border-accent-muted"
      disabled={busy}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  )
}
