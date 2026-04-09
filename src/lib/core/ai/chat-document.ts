export type ChatDocumentAction =
  | "chat"
  | "generate"
  | "continue"
  | "refine"
  | "rewrite"

/**
 * Integra la respuesta del asistente en el guion Fountain según la acción.
 * - `continue`: concatena al documento existente.
 * - Resto: reemplaza por el texto generado (guion completo en Fountain).
 */
export function mergeAssistantFountain(
  action: ChatDocumentAction,
  previousFountain: string,
  assistantText: string
): string {
  const next = assistantText.trim()
  if (!next) return previousFountain
  if (action === "continue") {
    const prev = previousFountain.trimEnd()
    if (!prev) return next
    return `${prev}\n\n${next}`
  }
  return next
}
