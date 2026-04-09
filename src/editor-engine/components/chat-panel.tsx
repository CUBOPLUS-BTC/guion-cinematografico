"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEditorChat } from "@/editor-engine/components/chat-context"
import { getTextFromUIMessage } from "@/editor-engine/utils/ui-message-text"
import {
  Loader2,
  Send,
  Sparkles,
  Type,
  Wand2,
  Repeat,
  Cpu,
} from "lucide-react"

// ─── Modelos disponibles ──────────────────────────────────────────────────────
export const AI_MODELS = [
  // GRATUITOS
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    label: "Llama 3.1 8B",
    provider: "Meta",
    tier: "free" as const,
    note: "Rápido y ligero",
  },
  {
    id: "google/gemma-3-12b-it:free",
    label: "Gemma 3 12B",
    provider: "Google",
    tier: "free" as const,
    note: "Buena calidad gratis",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    label: "Mistral 7B",
    provider: "Mistral",
    tier: "free" as const,
    note: "Creativo y fluido",
  },
  {
    id: "deepseek/deepseek-r1-0528:free",
    label: "DeepSeek R1",
    provider: "DeepSeek",
    tier: "free" as const,
    note: "Razonamiento avanzado",
  },
  // DE PAGA
  {
    id: "anthropic/claude-3-haiku",
    label: "Claude 3 Haiku",
    provider: "Anthropic",
    tier: "pro" as const,
    note: "Rápido, preciso",
  },
  {
    id: "anthropic/claude-3-5-sonnet",
    label: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    tier: "pro" as const,
    note: "Alta calidad narrativa",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "OpenAI",
    tier: "pro" as const,
    note: "Económico y capaz",
  },
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    provider: "OpenAI",
    tier: "pro" as const,
    note: "Máxima calidad",
  },
  {
    id: "google/gemini-flash-1.5",
    label: "Gemini Flash 1.5",
    provider: "Google",
    tier: "pro" as const,
    note: "Veloz y extenso",
  },
]

export const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free"

export type ChatPanelProps = {
  compact?: boolean
}

export function ChatPanel({ compact }: ChatPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const { messages, busy, runQuickAction, submitChat, stop, setModel } = useEditorChat()
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    setModel(value)
  }

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

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel)

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

          {/* Selector de modelo */}
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="h-8 text-xs border-accent-muted bg-bg-tertiary flex-1 min-w-0">
                <SelectValue>
                  <span className="flex items-center gap-1.5 truncate">
                    <span
                      className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                        currentModel?.tier === "free"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {currentModel?.tier === "free" ? "FREE" : "PRO"}
                    </span>
                    <span className="truncate">{currentModel?.label}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {/* Modelos gratuitos */}
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    ✦ Gratuitos
                  </p>
                  {AI_MODELS.filter((m) => m.tier === "free").map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs py-2">
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium">{m.label} <span className="text-text-muted font-normal">· {m.provider}</span></span>
                        <span className="text-[10px] text-text-muted">{m.note}</span>
                      </span>
                    </SelectItem>
                  ))}
                </div>
                <div className="border-t border-accent-muted mx-2 my-1" />
                {/* Modelos de paga */}
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    ★ Pro (requiere créditos)
                  </p>
                  {AI_MODELS.filter((m) => m.tier === "pro").map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs py-2">
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium">{m.label} <span className="text-text-muted font-normal">· {m.provider}</span></span>
                        <span className="text-[10px] text-text-muted">{m.note}</span>
                      </span>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Acciones rápidas */}
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

          {/* Input */}
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
