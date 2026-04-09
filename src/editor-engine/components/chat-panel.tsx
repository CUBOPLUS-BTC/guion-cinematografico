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
  RefreshCw,
} from "lucide-react"
import type { ModelInfo } from "@/app/api/models/route"
import { SynopsisPanel } from "@/editor-engine/components/synopsis-panel"

export const DEFAULT_MODEL = "openai/gpt-oss-20b:free"

export type ChatPanelProps = {
  compact?: boolean
  projectId?: string
  initialLogline?: string
  initialSynopsis?: string
}

export function ChatPanel({ compact, projectId, initialLogline = "", initialSynopsis = "" }: ChatPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const { messages, busy, runQuickAction, submitChat, stop, setModel, apiError, clearApiError } = useEditorChat()

  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [freeModels, setFreeModels] = useState<ModelInfo[]>([])
  const [proModels, setProModels] = useState<ModelInfo[]>([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [modelsError, setModelsError] = useState(false)

  const fetchModels = useCallback(async () => {
    setLoadingModels(true)
    setModelsError(false)
    try {
      const res = await fetch("/api/models")
      if (!res.ok) throw new Error("fetch failed")
      const data = (await res.json()) as { free: ModelInfo[]; pro: ModelInfo[] }
      setFreeModels(data.free ?? [])
      setProModels(data.pro ?? [])

      // Si el modelo actual no existe en la lista nueva, seleccionar el primero disponible
      const allIds = [...(data.free ?? []), ...(data.pro ?? [])].map((m) => m.id)
      if (allIds.length > 0 && !allIds.includes(selectedModel)) {
        const first = data.free?.[0]?.id ?? data.pro?.[0]?.id ?? DEFAULT_MODEL
        setSelectedModel(first)
        setModel(first)
      }
    } catch {
      setModelsError(true)
    } finally {
      setLoadingModels(false)
    }
  }, [selectedModel, setModel])

  useEffect(() => {
    void fetchModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const allModels = [...freeModels, ...proModels]
  const currentModel = allModels.find((m) => m.id === selectedModel)

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-bg-primary">
      <ScrollArea className="flex-1 min-h-0">
        <div className={`${padX} py-4 ${maxW} space-y-4`}>
          {projectId && (
            <div className="pt-1">
              <SynopsisPanel
                projectId={projectId}
                model={selectedModel}
                initialLogline={initialLogline}
                initialSynopsis={initialSynopsis}
              />
            </div>
          )}

          {messages.length === 0 && !apiError && (
            <p className="text-sm text-text-muted text-center italic py-4">
              Escribe una instrucción o usa una acción rápida abajo para generar tu guion.
            </p>
          )}

          {apiError && (
            <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Error de IA</p>
              <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">{apiError}</p>
              <button
                onClick={clearApiError}
                className="mt-2 text-[10px] text-red-500 underline hover:no-underline"
              >
                Cerrar
              </button>
            </div>
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

            {loadingModels ? (
              <div className="flex-1 h-8 rounded-md border border-accent-muted bg-bg-tertiary flex items-center px-3 gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-text-muted" />
                <span className="text-xs text-text-muted">Cargando modelos...</span>
              </div>
            ) : modelsError ? (
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-red-500">Error al cargar modelos</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => void fetchModels()}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Reintentar
                </Button>
              </div>
            ) : (
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="h-8 text-xs border-accent-muted bg-bg-tertiary flex-1 min-w-0">
                  <SelectValue>
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className={`text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${
                          currentModel?.tier === "free"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {currentModel?.tier === "free" ? "FREE" : "PRO"}
                      </span>
                      <span className="truncate">{currentModel?.name ?? selectedModel}</span>
                      {currentModel?.provider && (
                        <span className="text-text-muted shrink-0">· {currentModel.provider}</span>
                      )}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {freeModels.length > 0 && (
                    <>
                      <div className="px-2 pt-2 pb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          ✦ Gratuitos ({freeModels.length})
                        </p>
                      </div>
                      {freeModels.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs py-2">
                          <span className="flex flex-col gap-0.5">
                            <span className="font-medium">
                              {m.name}{" "}
                              <span className="text-text-muted font-normal">· {m.provider}</span>
                            </span>
                            <span className="text-[10px] text-text-muted">{m.note}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {proModels.length > 0 && (
                    <>
                      <div className="border-t border-accent-muted mx-2 my-1" />
                      <div className="px-2 pt-1 pb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          ★ Pro — requiere créditos ({proModels.length})
                        </p>
                      </div>
                      {proModels.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs py-2">
                          <span className="flex flex-col gap-0.5">
                            <span className="font-medium">
                              {m.name}{" "}
                              <span className="text-text-muted font-normal">· {m.provider}</span>
                            </span>
                            <span className="text-[10px] text-text-muted">{m.note}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            )}

            {!loadingModels && !modelsError && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={() => void fetchModels()}
                title="Actualizar lista de modelos"
              >
                <RefreshCw className="h-3 w-3 text-text-muted" />
              </Button>
            )}
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
