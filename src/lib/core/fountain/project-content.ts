import { DEFAULT_EDITOR_JSON } from "@/lib/core/editor-default-content"
import { convertTipTapToFountain } from "@/lib/core/fountain/convert-tiptap"
import { FountainParser } from "@/lib/core/fountain/parser"
import { parseFountainToBlocks } from "@/lib/core/fountain/semantic-parser"
import type { FountainElement } from "@/types/fountain"

/** Versión almacenada en `Project.content` para documentos Fountain en texto plano. */
export const PROJECT_CONTENT_VERSION = 2 as const

export type ProjectContentV2 = {
  v: typeof PROJECT_CONTENT_VERSION
  fountain: string
}

export function isProjectContentV2(value: unknown): value is ProjectContentV2 {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return o.v === PROJECT_CONTENT_VERSION && typeof o.fountain === "string"
}

function isLegacyTipTapDoc(value: unknown): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    (value as { type?: string }).type === "doc"
  )
}

/**
 * Normaliza `Project.content` (legacy TipTap JSON o v2) a texto Fountain.
 */
export function projectContentToFountainString(content: unknown): string {
  if (content == null) return ""
  if (typeof content === "string") return content
  if (isProjectContentV2(content)) return content.fountain
  if (isLegacyTipTapDoc(content)) {
    const elements = convertTipTapToFountain(content)
    return FountainParser.stringify(elements)
  }
  return ""
}

/**
 * AST Fountain para exportación PDF/FDX.
 * Usa el semantic parser para preservar etiquetas [CAMARA], [SONIDO], etc.
 */
export function projectContentToFountainElements(content: unknown): FountainElement[] {
  const text = projectContentToFountainString(content)
  if (!text.trim()) return []

  // Usar semantic parser para preservar todas las etiquetas de producción
  const blocks = parseFountainToBlocks(text)

  return blocks.map((block) => {
    // Reconstruir el texto con el prefijo semántico para que el PDF generator lo procese
    let displayText = block.text

    if (block.type === "action" && block.semanticTag !== "none") {
      const prefixMap: Record<string, string> = {
        scenography: "[ESCENOGRAFIA]",
        sound: "[SONIDO]",
        music: "[MUSICA]",
        camera: "[CAMARA]",
      }
      const prefix = prefixMap[block.semanticTag]
      if (prefix) displayText = `${prefix} ${block.text}`
    }

    if (block.type === "note" && block.semanticTag === "time") {
      displayText = `[[${block.text}]]`
    }

    return {
      type: block.type,
      text: displayText,
      metadata: block.metadata,
    }
  })
}

export function fountainStringToProjectContent(fountain: string): ProjectContentV2 {
  return { v: PROJECT_CONTENT_VERSION, fountain }
}

/** Contenido por defecto al crear proyecto — vacío. */
export function defaultProjectContent(): ProjectContentV2 {
  return { v: PROJECT_CONTENT_VERSION, fountain: "" }
}
