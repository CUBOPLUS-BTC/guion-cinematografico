"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { FountainBlock } from "@/types/fountain"
import {
  Clapperboard,
  Clock,
  ImageIcon,
  MessageSquare,
  Mic2,
  Music,
  User,
  AlignRight,
  Hash,
  StickyNote,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type ScreenplayBlockProps = {
  block: FountainBlock
  onCommit: (id: string, text: string) => void
  disabled?: boolean
}

function blockIcon(block: FountainBlock) {
  const { type, semanticTag } = block
  if (semanticTag === "scenography") return ImageIcon
  if (semanticTag === "sound") return Mic2
  if (semanticTag === "music") return Music
  if (semanticTag === "camera") return Clapperboard
  if (semanticTag === "time") return Clock
  switch (type) {
    case "scene_heading":
      return Clapperboard
    case "character":
      return User
    case "dialogue":
      return MessageSquare
    case "parenthetical":
      return MessageSquare
    case "transition":
      return AlignRight
    case "section":
      return Hash
    case "note":
      return StickyNote
    default:
      return MessageSquare
  }
}

function blockShellClass(block: FountainBlock): string {
  const { type, semanticTag } = block
  if (semanticTag === "scenography")
    return "bg-emerald-500/5 dark:bg-emerald-500/10"
  if (semanticTag === "sound")
    return "bg-sky-500/5 dark:bg-sky-500/10"
  if (semanticTag === "music")
    return "bg-violet-500/5 dark:bg-violet-500/10"
  if (semanticTag === "camera")
    return "bg-fuchsia-500/5 dark:bg-fuchsia-500/10"
  if (semanticTag === "time")
    return "bg-amber-500/5 dark:bg-amber-500/10"

  switch (type) {
    case "scene_heading":
      return "bg-[var(--fountain-scene)]/8"
    case "character":
      return "bg-[var(--fountain-character)]/6"
    case "dialogue":
      return "pl-8 md:pl-16 border-l border-accent-muted/40"
    case "parenthetical":
      return "pl-10 md:pl-20 italic text-text-muted text-sm"
    case "transition":
      return "text-right uppercase tracking-wide text-sm"
    case "section":
      return "mt-6 mb-2 pt-4 border-t border-accent-muted text-lg font-bold text-accent"
    case "centered":
      return "text-center"
    case "note":
      return "bg-[var(--fountain-note)]/8 text-sm"
    default:
      return "border-l border-transparent"
  }
}

function semanticLabel(block: FountainBlock): string | null {
  switch (block.semanticTag) {
    case "scenography":
      return "Escenografía"
    case "sound":
      return "Sonido"
    case "music":
      return "Música"
    case "camera":
      return "Cámara"
    case "time":
      return "Tiempo"
    default:
      return null
  }
}

export function ScreenplayBlock({
  block,
  onCommit,
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

  const Icon = blockIcon(block)
  const label = semanticLabel(block)
  const isDialogue = block.type === "dialogue"
  const isCharacter = block.type === "character"

  return (
    <div
      className={cn(
        "group rounded-md px-3 py-2 transition-colors",
        blockShellClass(block)
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            "mt-1 h-4 w-4 shrink-0 opacity-70",
            label ? "text-accent" : "text-text-muted"
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1">
          {label && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
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
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm",
              isCharacter && "text-center font-bold uppercase tracking-wide",
              isDialogue && "font-serif",
              block.type === "transition" && "text-right uppercase",
              block.type === "section" && "text-lg font-bold text-accent",
              disabled && "opacity-60 cursor-not-allowed"
            )}
            style={{
              fontFamily:
                block.type === "dialogue" || block.type === "character"
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
