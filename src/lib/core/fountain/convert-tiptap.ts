import { FountainElement, FountainElementType } from "@/types/fountain";

/**
 * Convierte el formato JSON de TipTap/ProseMirror a nuestro AST interno de Fountain.
 * Esto facilita el envío de contexto limpio a la IA.
 */
export function convertTipTapToFountain(json: unknown): FountainElement[] {
  const doc = json as { content?: unknown[] } | null
  if (!doc?.content || !Array.isArray(doc.content)) return []

  return doc.content.map((node: unknown) => {
    const n = node as { type?: string; content?: { text?: string }[]; attrs?: Record<string, unknown> }
    const textContent = n.content
      ? n.content.map((c) => c.text || "").join("")
      : ""

    return {
      type: (n.type || "action") as FountainElementType,
      text: textContent,
      metadata: n.attrs || {},
    }
  })
}
