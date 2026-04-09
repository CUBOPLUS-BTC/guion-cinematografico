"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { FountainBlock } from "@/types/fountain"
import { cn } from "@/lib/utils"

export type ScreenplayBlockProps = {
  block: FountainBlock
  onCommit: (id: string, text: string) => void
  onDelete?: (id: string) => void
  disabled?: boolean
}

/** Color del indicador lateral por tipo/tag semántico */
function blockAccentClass(block: FountainBlock): string {
  if (block.semanticTag === "scenography") return "bg-emerald-400"
  if (block.semanticTag === "sound")       return "bg-sky-400"
  if (block.semanticTag === "music")       return "bg-violet-400"
  if (block.semanticTag === "camera")      return "bg-fuchsia-400"
  if (block.semanticTag === "time")        return "bg-amber-400"
  switch (block.type) {
    case "scene_heading":  return "bg-blue-400"
    case "character":      return "bg-orange-400"
    case "dialogue":       return "bg-transparent"
    case "parenthetical":  return "bg-transparent"
    case "transition":     return "bg-gray-400"
    case "section":        return "bg-accent"
    case "note":           return "bg-yellow-400"
    default:               return "bg-transparent"
  }
}

/** Fondo del bloque */
function blockShellClass(block: FountainBlock): string {
  if (block.semanticTag === "scenography") return "bg-emerald-500/5 dark:bg-emerald-500/10"
  if (block.semanticTag === "sound")       return "bg-sky-500/5 dark:bg-sky-500/10"
  if (block.semanticTag === "music")       return "bg-violet-500/5 dark:bg-violet-500/10"
  if (block.semanticTag === "camera")      return "bg-fuchsia-500/5 dark:bg-fuchsia-500/10"
  if (block.semanticTag === "time")        return "bg-amber-500/5 dark:bg-amber-500/10"
  switch (block.type) {
    case "scene_heading":  return "bg-blue-500/5 dark:bg-blue-500/10"
    case "character":      return "bg-orange-500/5 dark:bg-orange-500/8"
    case "dialogue":       return "pl-8 md:pl-16 border-l border-accent-muted/40"
    case "parenthetical":  return "pl-10 md:pl-20 italic text-text-muted text-sm"
    case "transition":     return "text-right uppercase tracking-wide text-sm"
    case "section":        return "mt-6 mb-2 pt-4 border-t border-accent-muted text-lg font-bold text-accent"
    case "centered":       return "text-center"
    case "note":           return "bg-yellow-500/5 text-sm"
    default:               return ""
  }
}

function semanticLabel(block: FountainBlock): string | null {
  switch (block.semanticTag) {
    case "scenography": return "Escenografía"
    case "sound":       return "Sonido"
    case "music":       return "Música"
    case "camera":      return "Cámara"
    case "time":        return "Tiempo"
    default:            return null
  }
}

export function ScreenplayBlock({
  block,
  onCommit,
  onDelete,
  disabled,
}: ScreenplayBlockProps) {
  const [value, setValue] = useState(block.text)
  const ta = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(block.text)
  }, [block.id, block.text])

  const adjustHeight = useCallback(() => {
    const el = ta.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.max(el.scrollHeight, 40)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const label = semanticLabel(block)
  const isDialogue     = block.type === "dialogue"
  const isCharacter    = block.type === "character"
  const isScene        = block.type === "scene_heading"
  const showAccentBar  = block.type !== "dialogue" && block.type !== "parenthetical"

  return (
    <div
      className={cn(
        "group rounded-md px-3 py-2 transition-colors relative",
        blockShellClass(block)
      )}
    >
      <div className="flex items-start gap-3">

        {/* Indicador visual de tipo — barra de color */}
        {showAccentBar && (
          <span
            className={cn(
              "mt-1.5 w-1 shrink-0 rounded-full",
              isScene ? "h-5" : "h-3",
              blockAccentClass(block)
            )}
          />
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          {/* Etiqueta semántica */}
          {label && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-accent opacity-80">
              {label}
            </p>
          )}

          <textarea
            ref={ta}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              if (value !== block.text) onCommit(block.id, value)
            }}
            onKeyDown={(e) => {
              if (
                (e.key === "Backspace" || e.key === "Delete") &&
                value.trim() === "" &&
                onDelete
              ) {
                e.preventDefault()
                onDelete(block.id)
              }
            }}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent text-sm leading-relaxed outline-none",
              "focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm",
              isScene     && "font-bold uppercase tracking-wide text-text-primary",
              isCharacter && "text-center font-bold uppercase tracking-wide",
              isDialogue  && "font-serif",
              block.type === "transition"   && "text-right uppercase text-text-muted",
              block.type === "section"      && "text-base font-bold text-accent",
              block.type === "parenthetical" && "text-text-muted",
              block.semanticTag !== "none"  && "text-text-secondary",
              disabled && "opacity-60 cursor-not-allowed"
            )}
            style={{
              fontFamily:
                isDialogue || isCharacter
                  ? "var(--font-screenplay), Courier New, monospace"
                  : "inherit",
            }}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
