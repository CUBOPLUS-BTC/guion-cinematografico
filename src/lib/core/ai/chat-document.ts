import { enrichFountainWithSemanticTags } from "@/lib/core/ai/semantic-enricher"

export type ChatDocumentAction =
  | "chat"
  | "generate"
  | "continue"
  | "refine"
  | "rewrite"

/**
 * Limpia etiquetas no-Fountain que la IA puede generar ([ACCIÓN], [PERSONAJE], etc.)
 * preservando las etiquetas de producción válidas ([ESCENOGRAFIA], [CAMARA], etc.)
 */
function sanitizeAIOutput(text: string): string {
  const lines = text.split(/\r?\n/)
  const out: string[] = []

  // Etiquetas de producción válidas — NO eliminar
  const VALID_TAGS = /^\[(ESCENOGRAF[IÍ]A|C[AÁ]MARA|SONIDO|M[UÚ]SICA|ILUMINACI[OÓ]N|VFX)\]/i

  for (const raw of lines) {
    const line = raw.trim()

    // Descartar solo etiquetas no-Fountain inválidas (vacías sin contenido)
    if (/^\[(ACCIÓN|ACCION|ACTION|TRANSICIÓN|TRANSICION|TRANSITION|ENCABEZADO|HEADING)\]$/.test(line)) {
      continue
    }

    // Preservar etiquetas de producción válidas
    if (VALID_TAGS.test(line)) {
      out.push(line)
      continue
    }

    // Limpiar markdown: quitar bloques de código ```
    if (/^```/.test(line)) continue

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

    // Limpiar sufijos de etiqueta inválidos al final de línea
    const cleaned = line
      .replace(/\s*\[(ACCIÓN|ACCION|ACTION|ENCABEZADO|HEADING|TRANSICIÓN|TRANSICION)\]\s*$/i, "")
      .trim()

    if (cleaned.length > 0) out.push(cleaned)
  }

  return out.join("\n")
}

/**
 * Detecta si el texto parece Fountain válido (genérico, sin nombres hardcodeados).
 */
function looksLikeFountain(text: string): boolean {
  if (!text.trim()) return false
  // Tiene encabezado de escena, sección, etiqueta semántica o título
  return /^(INT\.|EXT\.|EST\.|#|\[ESCENOGRAF|VOZ\s+PROFUNDA|FADE IN:|FUNDIDO)/im.test(text)
    || text.split("\n").filter(l => l.trim()).length >= 4 // al menos 4 líneas de contenido
}

/**
 * Integra la respuesta del asistente en el guion Fountain según la acción.
 * - `chat`: NO modifica el documento — solo es una respuesta conversacional.
 * - `continue`: concatena al documento existente.
 * - `generate`, `rewrite`, `refine`: reemplaza el documento completo.
 */
export function mergeAssistantFountain(
  action: ChatDocumentAction,
  previousFountain: string,
  assistantText: string
): string {
  // En modo chat puro, la IA responde pero NO sobreescribe el guion
  if (action === "chat") return previousFountain

  const sanitized = sanitizeAIOutput(assistantText.trim())
  if (!sanitized) return previousFountain

  // Enriquecer con etiquetas semánticas si el modelo no las generó
  const enriched = enrichFountainWithSemanticTags(sanitized)

  if (action === "continue") {
    const prev = previousFountain.trimEnd()
    if (!prev) return enriched
    return `${prev}\n\n${enriched}`
  }

  // generate / rewrite / refine → reemplazar si parece contenido válido
  if (!looksLikeFountain(enriched) && previousFountain.trim()) {
    console.warn("[mergeAssistantFountain] Output no parece Fountain, preservando documento anterior.")
    return previousFountain
  }

  return enriched
}
