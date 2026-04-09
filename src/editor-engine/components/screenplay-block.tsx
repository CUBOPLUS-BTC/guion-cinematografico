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

const SEMANTIC_COLORS: Record<string, { bg: string; bar: string; label: string; labelColor: string }> = {
  scenography: { bg: "bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-400", bar: "", label: "🏛 Escenografía", labelColor: "text-emerald-600 dark:text-emerald-400" },
  sound:       { bg: "bg-sky-50 dark:bg-sky-950/30 border-l-2 border-sky-400",             bar: "", label: "🎙 Sonido",        labelColor: "text-sky-600 dark:text-sky-400" },
  music:       { bg: "bg-violet-50 dark:bg-violet-950/30 border-l-2 border-violet-400",   bar: "", label: "🎵 Música",        labelColor: "text-violet-600 dark:text-violet-400" },
  camera:      { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30 border-l-2 border-fuchsia-400",bar: "", label: "🎬 Cámara",        labelColor: "text-fuchsia-600 dark:text-fuchsia-400" },
  time:        { bg: "bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-400",      bar: "", label: "⏱ Tiempo",         labelColor: "text-amber-600 dark:text-amber-400" },
}

export function ScreenplayBlock({ block, onCommit, onDelete, disabled }: ScreenplayBlockProps) {
  const [value, setValue] = useState(block.text)
  const ta = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setValue(block.text) }, [block.id, block.text])

  const adjustHeight = useCallback(() => {
    const el = ta.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.max(el.scrollHeight, 24)}px`
  }, [])

  useEffect(() => { adjustHeight() }, [value, adjustHeight])

  const semantic = block.semanticTag !== "none" ? SEMANTIC_COLORS[block.semanticTag] : null
  const isScene  = block.type === "scene_heading"
  const isChar   = block.type === "character"
  const isDial   = block.type === "dialogue"
  const isParen  = block.type === "parenthetical"
  const isTrans  = block.type === "transition"
  const isSection = block.type === "section"
  const isNote   = block.type === "note"

  // ── Layout wrapper classes ───────────────────────────────────────────────
  const wrapClass = cn(
    "w-full transition-colors group",
    // Scene heading — standout
    isScene   && "my-5 py-2 px-4 bg-gradient-to-r from-blue-600/10 to-transparent border-l-4 border-blue-500 rounded-r-md",
    // Semantic production blocks
    semantic  && cn("my-1.5 py-2 px-3 rounded-md", semantic.bg),
    // Character — centered block
    isChar    && "my-3 flex justify-center",
    // Dialogue — indent
    isDial    && "my-0.5 px-8 md:px-20",
    // Parenthetical — indent more
    isParen   && "my-0 px-10 md:px-24",
    // Transition
    isTrans   && "my-4 px-4",
    // Section / Act
    isSection && "my-6 py-3 px-4 border-b-2 border-accent",
    // Note / timing
    isNote    && "my-1 px-3 py-1 rounded bg-amber-50 dark:bg-amber-950/20",
    // Default action
    !isScene && !semantic && !isChar && !isDial && !isParen && !isTrans && !isSection && !isNote
      && "my-1 px-4"
  )

  // ── Textarea classes ─────────────────────────────────────────────────────
  const taClass = cn(
    "w-full resize-none bg-transparent outline-none leading-relaxed",
    "focus-visible:ring-0",
    disabled && "cursor-not-allowed opacity-60",

    // Scene heading
    isScene   && "font-bold uppercase tracking-widest text-sm text-blue-700 dark:text-blue-300",

    // Character name
    isChar    && "font-bold uppercase tracking-widest text-sm text-orange-700 dark:text-orange-300 text-center w-auto min-w-[120px]",

    // Dialogue
    isDial    && "font-mono text-sm text-text-primary leading-relaxed",

    // Parenthetical
    isParen   && "text-sm italic text-text-muted",

    // Transition
    isTrans   && "text-sm uppercase font-semibold text-right text-text-muted tracking-wider",

    // Section / Act
    isSection && "text-base font-black uppercase tracking-widest text-accent",

    // Note / time
    isNote    && "text-xs text-amber-700 dark:text-amber-400 font-mono",

    // Semantic blocks
    semantic  && "text-sm text-text-secondary",

    // Plain action
    !isScene && !isChar && !isDial && !isParen && !isTrans && !isSection && !isNote && !semantic
      && "text-sm text-text-primary",
  )

  return (
    <div className={wrapClass}>
      {/* Semantic label badge */}
      {semantic && (
        <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-1", semantic.labelColor)}>
          {semantic.label}
        </p>
      )}

      {isSection && (
        <p className="text-[9px] font-bold uppercase tracking-widest text-accent/60 mb-0.5">
          — Sección —
        </p>
      )}

      <textarea
        ref={ta}
        value={value}
        disabled={disabled}
        rows={1}
        className={taClass}
        style={{
          fontFamily: isDial || isChar
            ? "'Courier Prime', 'Courier New', Courier, monospace"
            : "inherit",
        }}
        spellCheck={false}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { if (value !== block.text) onCommit(block.id, value) }}
        onKeyDown={(e) => {
          if ((e.key === "Backspace" || e.key === "Delete") && value.trim() === "" && onDelete) {
            e.preventDefault()
            onDelete(block.id)
          }
        }}
      />
    </div>
  )
}
