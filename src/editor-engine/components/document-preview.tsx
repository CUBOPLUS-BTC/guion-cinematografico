"use client"

import { useEffect, useMemo } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { useChatStore } from "@/editor-engine/store/chat-store"
import { useEditorStore } from "@/editor-engine/store/editor-store"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

/** Vista central: guion en Markdown/Fountain renderizado con Streamdown. */
export function DocumentPreview() {
  const documentFountain = useChatStore((s) => s.documentFountain)
  const streamingPreview = useChatStore((s) => s.streamingPreview)
  const { zoom, setZoom, stats, updateStatsFromFountain } = useEditorStore()

  const displayMarkdown = useMemo(() => {
    const raw = streamingPreview ?? documentFountain
    if (!raw.trim()) {
      return "_El documento está vacío. Usa el chat de IA a la izquierda para generar o pega Fountain._"
    }
    return raw
  }, [streamingPreview, documentFountain])

  useEffect(() => {
    updateStatsFromFountain(documentFountain)
  }, [documentFountain, updateStatsFromFountain])

  return (
    <div className="flex flex-col h-full min-w-0 bg-bg-primary">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-accent-muted bg-bg-secondary shrink-0">
        <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
          Documento
        </span>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-[9px] text-text-muted uppercase font-bold">
            <span>{stats.wordCount} pal</span>
            <span>{stats.sceneCount} esc</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 border-accent-muted"
              onClick={() => setZoom(Math.max(70, zoom - 10))}
              aria-label="Alejar"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-mono text-text-muted w-9 text-center">{zoom}%</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 border-accent-muted"
              onClick={() => setZoom(Math.min(140, zoom + 10))}
              aria-label="Acercar"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-8 px-4 md:px-10">
        <div
          className="mx-auto max-w-[48rem] bg-bg-canvas text-zinc-900 shadow-2xl rounded-sm border border-zinc-200/80 min-h-[70vh] px-8 py-10"
          style={{
            fontFamily: "var(--font-screenplay), Courier New, monospace",
            fontSize: `${12 * (zoom / 100)}pt`,
            lineHeight: 1.05,
          }}
        >
          <Streamdown
            mode={streamingPreview ? undefined : "static"}
            plugins={{ code }}
            className="screenplay-streamdown text-zinc-900 [&_pre]:bg-zinc-100 [&_code]:text-zinc-800"
          >
            {displayMarkdown}
          </Streamdown>
        </div>
      </div>
    </div>
  )
}
