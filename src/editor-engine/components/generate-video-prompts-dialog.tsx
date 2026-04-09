"use client"

import { useCallback, useState } from "react"
import { Clapperboard, Copy, Download, FileJson, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/editor-engine/store/chat-store"

export type VideoPromptItem = {
  sceneNumber: number
  sceneHeading: string
  prompt: string
  duration?: string
  notes?: string
}

export type GenerateVideoPromptsDialogProps = {
  projectId: string
}

export function GenerateVideoPromptsDialog({
  projectId,
}: GenerateVideoPromptsDialogProps) {
  const documentFountain = useChatStore((s) => s.documentFountain)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<VideoPromptItem[]>([])
  const [model, setModel] = useState<string | null>(null)

  const runGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setPrompts([])
    try {
      const res = await fetch(`/api/projects/${projectId}/video-prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fountain: documentFountain }),
      })
      const data = (await res.json()) as {
        error?: string
        prompts?: VideoPromptItem[]
        model?: string
      }
      if (!res.ok) {
        setError(data.error ?? "Error al generar prompts")
        return
      }
      if (data.prompts?.length) {
        setPrompts(data.prompts)
        setModel(data.model ?? null)
      } else {
        setError("No se recibieron prompts")
      }
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }, [projectId, documentFountain])

  const copyAll = useCallback(async () => {
    const text = prompts
      .map(
        (p) =>
          `--- Escena ${p.sceneNumber}: ${p.sceneHeading} ---\n${p.prompt}${p.duration ? `\nDuración sugerida: ${p.duration}` : ""}${p.notes ? `\nNotas: ${p.notes}` : ""}\n`
      )
      .join("\n")
    await navigator.clipboard.writeText(text)
  }, [prompts])

  const downloadJson = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ model, prompts }, null, 2)],
      { type: "application/json" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `video-prompts-${projectId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [model, prompts, projectId])

  const downloadTxt = useCallback(() => {
    const text = prompts
      .map(
        (p) =>
          `=== Escena ${p.sceneNumber} · ${p.sceneHeading} ===\n${p.prompt}${p.duration ? `\nDuración: ${p.duration}` : ""}${p.notes ? `\nNotas: ${p.notes}` : ""}\n`
      )
      .join("\n\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `video-prompts-${projectId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [prompts, projectId])

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) void runGenerate()
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-[10px] md:text-xs border-accent-muted gap-1.5"
        >
          <Clapperboard className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Generar prompts</span>
          <span className="sm:hidden">Prompts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[min(88vh,860px)] max-w-4xl flex-col gap-0 overflow-hidden border-accent-muted bg-bg-secondary p-0 shadow-lg">
        <DialogHeader className="shrink-0 border-b border-accent-muted/80 bg-bg-secondary px-6 pt-6 pb-4">
          <DialogTitle className="text-text-primary flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-accent" />
            Prompts para video
          </DialogTitle>
          <DialogDescription className="text-text-muted text-sm">
            Prompts secuenciales listos para pegar en herramientas de generación de
            video. Se generan a partir del guion actual del proyecto.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm">Analizando el guion y generando prompts…</p>
              </div>
            )}
            {error && !loading && (
              <div className="py-6">
                <p className="rounded-lg border border-red-300/60 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}
            {!loading && !error && prompts.length > 0 && (
              <div className="space-y-4 py-5 pb-6">
                <div className="rounded-xl border border-accent-muted/80 bg-bg-primary/70 px-4 py-3 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">
                        Resumen de exportación
                      </p>
                      <p className="text-sm text-text-primary">
                        {prompts.length} escenas convertidas en prompts secuenciales para video.
                      </p>
                    </div>
                    {model && (
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary break-all">
                        Modelo: {model}
                      </p>
                    )}
                  </div>
                </div>

                <Accordion type="multiple" className="w-full space-y-3">
                  {prompts.map((p, idx) => (
                    <AccordionItem
                      key={`${p.sceneNumber}-${idx}-${p.sceneHeading.slice(0, 24)}`}
                      value={`scene-${idx}`}
                      className="overflow-hidden rounded-xl border border-accent-muted/80 bg-bg-canvas/95 shadow-sm"
                    >
                      <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-black/[0.025] dark:hover:bg-white/[0.02]">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
                            <span>Escena {String(p.sceneNumber).padStart(2, "0")}</span>
                            {p.duration && <span>{p.duration}</span>}
                          </div>
                          <p className="mt-2 break-words pr-4 font-screenplay text-sm leading-6 uppercase tracking-[0.08em] text-text-primary">
                            {p.sceneHeading}
                          </p>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="border-t border-black/10 bg-white/70 px-5 pt-5 pb-5 dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                          <section className="min-w-0 space-y-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">
                                  Prompt principal
                                </p>
                                <p className="text-sm text-text-secondary">
                                  Redacción lista para IA de video externa.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1 self-start border-accent-muted/80 bg-bg-primary/60 text-xs"
                                onClick={() =>
                                  void navigator.clipboard.writeText(
                                    `${p.prompt}${p.duration ? `\n\nDuración: ${p.duration}` : ""}${p.notes ? `\n\nNotas: ${p.notes}` : ""}`
                                  )
                                }
                              >
                                <Copy className="h-3 w-3" />
                                Copiar prompt
                              </Button>
                            </div>

                            <ScrollArea className="max-h-[34vh] w-full rounded-lg border border-black/10 bg-white shadow-inner dark:border-white/10 dark:bg-black/10">
                              <div className="p-4">
                                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-text-primary">
                                  {p.prompt}
                                </p>
                              </div>
                            </ScrollArea>
                          </section>

                          <aside className="space-y-3 rounded-lg border border-black/10 bg-bg-primary/65 p-4 dark:border-white/10">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">
                              Ficha técnica
                            </p>
                            <dl className="space-y-3 text-sm text-text-secondary">
                              <div className="space-y-1">
                                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
                                  Escena
                                </dt>
                                <dd className="font-screenplay text-sm uppercase tracking-[0.06em] text-text-primary break-words">
                                  {p.sceneHeading}
                                </dd>
                              </div>

                              <div className="space-y-1">
                                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
                                  Duración sugerida
                                </dt>
                                <dd className="text-text-primary">{p.duration ?? "No especificada"}</dd>
                              </div>

                              <div className="space-y-1">
                                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
                                  Notas
                                </dt>
                                <dd className="whitespace-pre-wrap break-words text-text-primary">
                                  {p.notes ?? "Sin observaciones adicionales."}
                                </dd>
                              </div>
                            </dl>
                          </aside>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="shrink-0 flex-row flex-wrap justify-end gap-2 border-t border-accent-muted bg-bg-tertiary/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={prompts.length === 0 || loading}
            onClick={() => void copyAll()}
            className="gap-1 border-accent-muted/80 bg-bg-secondary/70"
          >
            <Copy className="h-3 w-3" />
            Copiar todos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={prompts.length === 0 || loading}
            onClick={downloadTxt}
            className="gap-1 border-accent-muted/80 bg-bg-secondary/70"
          >
            <FileText className="h-3 w-3" />
            .txt
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={prompts.length === 0 || loading}
            onClick={downloadJson}
            className="gap-1 border-accent-muted/80 bg-bg-secondary/70"
          >
            <FileJson className="h-3 w-3" />
            JSON
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1 bg-accent text-primary-foreground"
            onClick={() => void runGenerate()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            Regenerar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
