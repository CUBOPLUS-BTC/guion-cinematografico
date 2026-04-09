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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 bg-bg-secondary border-accent-muted">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="text-text-primary flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-accent" />
            Prompts para video (IA externa)
          </DialogTitle>
          <DialogDescription className="text-text-muted text-sm">
            Prompts secuenciales listos para pegar en herramientas de generación de
            video. Se generan a partir del guion actual del proyecto.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-[200px] max-h-[55vh] px-6">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-sm">Analizando el guion y generando prompts…</p>
            </div>
          )}
          {error && !loading && (
            <p className="text-sm text-red-600 dark:text-red-400 py-4">{error}</p>
          )}
          {!loading && !error && prompts.length > 0 && (
            <div className="space-y-2 pb-4">
              {model && (
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  Modelo: {model}
                </p>
              )}
              <Accordion type="multiple" className="w-full">
                {prompts.map((p, idx) => (
                  <AccordionItem
                    key={`${p.sceneNumber}-${idx}-${p.sceneHeading.slice(0, 24)}`}
                    value={`scene-${idx}`}
                    className="border-accent-muted"
                  >
                    <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                      <span className="font-semibold text-text-primary">
                        Escena {p.sceneNumber}: {p.sceneHeading}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed bg-bg-tertiary rounded-md p-3 border border-accent-muted">
                        {p.prompt}
                      </p>
                      {(p.duration || p.notes) && (
                        <div className="text-[10px] text-text-muted space-y-1">
                          {p.duration && (
                            <p>
                              <span className="font-bold text-accent">Duración:</span>{" "}
                              {p.duration}
                            </p>
                          )}
                          {p.notes && (
                            <p>
                              <span className="font-bold text-accent">Notas:</span>{" "}
                              {p.notes}
                            </p>
                          )}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() =>
                          void navigator.clipboard.writeText(
                            `${p.prompt}${p.duration ? `\n\nDuración: ${p.duration}` : ""}${p.notes ? `\n\nNotas: ${p.notes}` : ""}`
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                        Copiar este prompt
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-accent-muted flex-row flex-wrap gap-2 justify-end shrink-0 bg-bg-tertiary/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={prompts.length === 0 || loading}
            onClick={() => void copyAll()}
            className="gap-1"
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
            className="gap-1"
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
            className="gap-1"
          >
            <FileJson className="h-3 w-3" />
            JSON
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1 bg-accent text-white"
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
