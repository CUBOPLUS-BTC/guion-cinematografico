"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/editor-engine/store/chat-store"
import { Loader2, Sparkles, ChevronDown, ChevronUp, FileText } from "lucide-react"

type SynopsisData = {
  logline: string
  synopsis: string
}

type Props = {
  projectId: string
  model: string
  initialLogline?: string
  initialSynopsis?: string
}

export function SynopsisPanel({ projectId, model, initialLogline = "", initialSynopsis = "" }: Props) {
  const [open, setOpen] = useState(false)
  const [logline, setLogline] = useState(initialLogline)
  const [synopsis, setSynopsis] = useState(initialSynopsis)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const documentFountain = useChatStore((s) => s.documentFountain)

  const generate = useCallback(async () => {
    if (!documentFountain.trim()) {
      setError("El guion está vacío. Genera el guion primero.")
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/synopsis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fountain: documentFountain, model }),
      })
      const data = (await res.json()) as SynopsisData & { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Error desconocido")
      setLogline(data.logline)
      setSynopsis(data.synopsis)
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar")
    } finally {
      setGenerating(false)
    }
  }, [documentFountain, model, projectId])

  const hasContent = logline || synopsis

  return (
    <div className="border border-accent-muted rounded-lg overflow-hidden bg-bg-secondary">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          Logline y Sinopsis
          {hasContent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">
              GENERADO
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-accent-muted">
          {/* Botón generar */}
          <div className="pt-3">
            <Button
              size="sm"
              onClick={() => void generate()}
              disabled={generating}
              className="w-full gap-2 bg-accent text-white"
            >
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {generating ? "Generando..." : hasContent ? "Regenerar con IA" : "Generar con IA"}
            </Button>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded p-2">
              {error}
            </p>
          )}

          {/* Logline */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Logline
            </label>
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="Una frase que capture la esencia del guion..."
              rows={2}
              className="w-full text-sm rounded-md border border-accent-muted bg-bg-primary px-3 py-2 text-text-primary placeholder:text-text-muted resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Sinopsis */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Sinopsis
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Resumen narrativo del corto..."
              rows={5}
              className="w-full text-sm rounded-md border border-accent-muted bg-bg-primary px-3 py-2 text-text-primary placeholder:text-text-muted resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>
      )}
    </div>
  )
}
