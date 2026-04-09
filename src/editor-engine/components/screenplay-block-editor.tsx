"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  blocksToFountain,
  parseFountainToBlocks,
  updateBlockText,
} from "@/lib/core/fountain/semantic-parser"
import { useChatStore } from "@/editor-engine/store/chat-store"
import type { FountainBlock } from "@/types/fountain"
import { ScreenplayBlock } from "@/editor-engine/components/screenplay-block"

/** Editor de guion por bloques sincronizado con documentFountain (evita bucles con ref). */
export function ScreenplayBlockEditor({ disabled }: { disabled?: boolean }) {
  const documentFountain = useChatStore((s) => s.documentFountain)
  const setDocumentFountain = useChatStore((s) => s.setDocumentFountain)

  const [blocks, setBlocks] = useState<FountainBlock[]>(() =>
    parseFountainToBlocks(documentFountain)
  )
  const lastEmitted = useRef<string | null>(null)

  useEffect(() => {
    if (documentFountain === lastEmitted.current) return
    setBlocks(parseFountainToBlocks(documentFountain))
    lastEmitted.current = documentFountain
  }, [documentFountain])

  const onCommit = useCallback(
    (id: string, text: string) => {
      setBlocks((prev) => {
        const next = updateBlockText(prev, id, text)
        const fountain = blocksToFountain(next)
        lastEmitted.current = fountain
        // Defer internal store update to avoid "update while rendering" error
        setTimeout(() => setDocumentFountain(fountain, { markDirty: true }), 0)
        return next
      })
    },
    [setDocumentFountain]
  )

  const onDelete = useCallback(
    (id: string) => {
      setBlocks((prev) => {
        const next = prev.filter((b) => b.id !== id)
        const fountain = blocksToFountain(next)
        lastEmitted.current = fountain
        setTimeout(() => setDocumentFountain(fountain, { markDirty: true }), 0)
        return next
      })
    },
    [setDocumentFountain]
  )

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-0 px-8 py-16 text-center select-none">
        <div className="mb-4 text-4xl opacity-30">🎬</div>
        <p className="text-base font-semibold text-text-muted mb-2">
          Tu guion está vacío
        </p>
        <p className="text-sm text-text-muted opacity-70 max-w-sm leading-relaxed">
          Escribe una instrucción en el panel izquierdo y presiona <span className="font-semibold">Generar</span> para que la IA construya tu guion, o escribe directo usando los botones de acción rápida.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto space-y-3 pb-10">
        {blocks.map((block) => (
          <ScreenplayBlock
            key={block.id}
            block={block}
            onCommit={onCommit}
            onDelete={onDelete}
            disabled={disabled}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
