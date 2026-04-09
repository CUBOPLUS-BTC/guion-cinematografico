export type ChatDocumentAction =
  | "chat"
  | "generate"
  | "continue"
  | "refine"
  | "rewrite"

/**
 * Limpia etiquetas no-Fountain que la IA puede generar ([ACCIÓN], [PERSONAJE], etc.)
 * y las convierte al Fountain equivalente.
 */
function sanitizeAIOutput(text: string): string {
  const lines = text.split(/\r?\n/)
  const out: string[] = []

  for (const raw of lines) {
    const line = raw.trim()

    // Descartar líneas que son solo etiquetas vacías
    if (/^\[(ACCIÓN|ACCION|ACTION|TRANSICIÓN|TRANSICION|TRANSITION|ENCABEZADO|HEADING)\]$/.test(line)) {
      continue
    }

    // [PERSONAJE] Nombre → NOMBRE
    const charMatch = line.match(/^\[PERSONAJE\]\s*(.+)$/i)
    if (charMatch) { out.push(charMatch[1].trim().toUpperCase()); continue }

    // [DIÁLOGO] texto → texto
    const dialogMatch = line.match(/^\[DI[ÁA]LOGO\]\s*(.*)$/i)
    if (dialogMatch) { out.push(dialogMatch[1].trim()); continue }

    // [ACOTACIÓN] texto → (texto)
    const parenMatch = line.match(/^\[ACOTACI[ÓO]N\]\s*(.*)$/i)
    if (parenMatch) {
      const t = parenMatch[1].trim()
      out.push(t.startsWith("(") ? t : `(${t})`)
      continue
    }

    // Limpiar sufijos de etiqueta al final de la línea
    const cleaned = line
      .replace(/\s*\[(ACCIÓN|ACCION|ACTION|ENCABEZADO|HEADING|TRANSICIÓN|TRANSICION)\]\s*$/i, "")
      .trim()

    if (cleaned.length > 0) out.push(cleaned)
  }

  return out.join("\n")
}

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
  const next = sanitizeAIOutput(assistantText.trim())
  if (!next) return previousFountain
  if (action === "continue") {
    const prev = previousFountain.trimEnd()
    if (!prev) return next
    return `${prev}\n\n${next}`
  }
  return next
}
