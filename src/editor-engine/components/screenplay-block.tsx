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

// ── Configuración visual por tipo/tag ──────────────────────────────────────

interface BlockConfig {
  label: string
  labelColor: string
  leftBorder: string
  bg: string
  textClass: string
  indent?: string
  fullWidth?: boolean
}

function getBlockConfig(block: FountainBlock): BlockConfig {
  // Etiquetas semánticas de producción
  if (block.semanticTag === "scenography") return {
    label: "🏛 ESCENOGRAFÍA",
    labelColor: "text-emerald-600 dark:text-emerald-400",
    leftBorder: "border-l-[3px] border-emerald-400",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/25",
    textClass: "text-sm text-emerald-900 dark:text-emerald-100",
  }
  if (block.semanticTag === "camera") return {
    label: "🎬 CÁMARA",
    labelColor: "text-fuchsia-600 dark:text-fuchsia-400",
    leftBorder: "border-l-[3px] border-fuchsia-400",
    bg: "bg-fuchsia-50/80 dark:bg-fuchsia-950/25",
    textClass: "text-sm text-fuchsia-900 dark:text-fuchsia-100",
  }
  if (block.semanticTag === "sound") return {
    label: "🎙 SONIDO",
    labelColor: "text-sky-600 dark:text-sky-400",
    leftBorder: "border-l-[3px] border-sky-400",
    bg: "bg-sky-50/80 dark:bg-sky-950/25",
    textClass: "text-sm text-sky-900 dark:text-sky-100",
  }
  if (block.semanticTag === "music") return {
    label: "🎵 MÚSICA",
    labelColor: "text-violet-600 dark:text-violet-400",
    leftBorder: "border-l-[3px] border-violet-400",
    bg: "bg-violet-50/80 dark:bg-violet-950/25",
    textClass: "text-sm text-violet-900 dark:text-violet-100",
  }
  if (block.semanticTag === "time") return {
    label: "⏱ TIMING",
    labelColor: "text-amber-600 dark:text-amber-400",
    leftBorder: "border-l-[3px] border-amber-400",
    bg: "bg-amber-50/80 dark:bg-amber-950/25",
    textClass: "text-xs font-mono text-amber-800 dark:text-amber-300",
  }

  // Tipos estructurales
  switch (block.type) {
    case "scene_heading": return {
      label: "📍 ESCENA",
      labelColor: "text-blue-600 dark:text-blue-400",
      leftBorder: "border-l-[4px] border-blue-500",
      bg: "bg-blue-50/60 dark:bg-blue-950/20",
      textClass: "font-bold uppercase tracking-widest text-sm text-blue-800 dark:text-blue-200",
    }
    case "character": return {
      label: "👤 PERSONAJE",
      labelColor: "text-orange-500 dark:text-orange-400",
      leftBorder: "",
      bg: "",
      textClass: "font-bold uppercase tracking-widest text-sm text-orange-700 dark:text-orange-300 text-center",
      fullWidth: true,
    }
    case "dialogue": return {
      label: "💬 DIÁLOGO",
      labelColor: "text-gray-400 dark:text-gray-500",
      leftBorder: "border-l-[2px] border-gray-200 dark:border-gray-700",
      bg: "",
      textClass: "text-sm text-gray-800 dark:text-gray-200",
      indent: "pl-10 md:pl-16",
    }
    case "parenthetical": return {
      label: "( acotación )",
      labelColor: "text-gray-400 dark:text-gray-500",
      leftBorder: "",
      bg: "",
      textClass: "text-xs italic text-gray-500 dark:text-gray-400 text-center",
      fullWidth: true,
    }
    case "transition": return {
      label: "➡ TRANSICIÓN",
      labelColor: "text-gray-400 dark:text-gray-500",
      leftBorder: "",
      bg: "",
      textClass: "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right",
      fullWidth: true,
    }
    case "section": return {
      label: "📋 SECCIÓN",
      labelColor: "text-accent",
      leftBorder: "border-l-[3px] border-accent",
      bg: "bg-accent/5",
      textClass: "font-black uppercase tracking-widest text-base text-accent",
    }
    case "note": return {
      label: "📝 NOTA",
      labelColor: "text-yellow-600 dark:text-yellow-400",
      leftBorder: "border-l-[2px] border-yellow-400",
      bg: "bg-yellow-50/60 dark:bg-yellow-950/20",
      textClass: "text-xs font-mono text-yellow-700 dark:text-yellow-300",
    }
    default: return {
      label: "✏ ACCIÓN",
      labelColor: "text-gray-400 dark:text-gray-500",
      leftBorder: "",
      bg: "",
      textClass: "text-sm text-gray-800 dark:text-gray-200 leading-relaxed",
    }
  }
}

// ── Componente ──────────────────────────────────────────────────────────────

export function ScreenplayBlock({ block, onCommit, onDelete, disabled }: ScreenplayBlockProps) {
  const [value, setValue] = useState(block.text)
  const ta = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setValue(block.text) }, [block.id, block.text])

  const adjustHeight = useCallback(() => {
    const el = ta.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.max(el.scrollHeight, 20)}px`
  }, [])

  useEffect(() => { adjustHeight() }, [value, adjustHeight])

  const cfg = getBlockConfig(block)
  const isCharOrTrans = block.type === "character" || block.type === "transition" || block.type === "parenthetical"

  return (
    <div className={cn(
      "group relative flex items-start gap-0 transition-colors",
      block.type === "scene_heading" && "mt-6 mb-1",
      block.type === "character" && "mt-4 mb-0 justify-center",
      block.type === "dialogue" && "mb-0",
      block.type === "parenthetical" && "mb-0 justify-center",
      block.type === "transition" && "mt-4 mb-2",
      block.type === "section" && "mt-8 mb-2",
    )}>

      {/* Etiqueta de tipo — columna izquierda */}
      {!isCharOrTrans && (
        <div className="w-[90px] shrink-0 pt-1.5 pr-2 text-right hidden md:block">
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-widest leading-none opacity-0 group-hover:opacity-100 transition-opacity",
            cfg.labelColor
          )}>
            {cfg.label.replace(/^[^\s]+\s/, "")}
          </span>
        </div>
      )}

      {/* Bloque principal */}
      <div className={cn(
        "flex-1 min-w-0 rounded-md px-3 py-1.5",
        cfg.leftBorder,
        cfg.bg,
        cfg.indent,
        isCharOrTrans && "w-full max-w-[380px]"
      )}>

        {/* Badge siempre visible para bloques semánticos */}
        {block.semanticTag !== "none" && (
          <span className={cn(
            "inline-block text-[8px] font-bold uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded-sm",
            cfg.labelColor,
            cfg.bg ? "bg-white/40 dark:bg-black/20" : "bg-gray-100 dark:bg-white/5"
          )}>
            {cfg.label}
          </span>
        )}

        {/* Para escena — badge visible siempre */}
        {block.type === "scene_heading" && (
          <span className={cn(
            "inline-block text-[8px] font-bold uppercase tracking-widest mb-1 mr-2",
            cfg.labelColor, "opacity-70"
          )}>
            {cfg.label.replace(/^[^\s]+\s/, "")}
          </span>
        )}

        <textarea
          ref={ta}
          value={value}
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent outline-none",
            "focus-visible:ring-0 transition-colors",
            cfg.textClass,
            disabled && "cursor-not-allowed opacity-50"
          )}
          style={{
            fontFamily: block.type === "dialogue" || block.type === "character"
              ? "'Courier Prime', 'Courier New', Courier, monospace"
              : "inherit",
            lineHeight: "1.6",
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
    </div>
  )
}
