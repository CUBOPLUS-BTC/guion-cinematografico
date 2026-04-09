import { enrichFountainWithSemanticTags } from "@/lib/core/ai/semantic-enricher"

export type ChatDocumentAction =
  | "chat"
  | "generate"
  | "continue"
  | "refine"
  | "rewrite"

const VALID_SEMANTIC = /^\[(ESCENOGRAF[IÍ]A|C[AÁ]MARA|SONIDO|M[UÚ]SICA|ILUMINACI[OÓ]N|VFX)\]/i

/**
 * Limpia el output de la IA: quita markdown y preserva Fountain + etiquetas semánticas.
 */
function sanitize(text: string): string {
  const lines = text.split(/\r?\n/)
  const result: string[] = []
  let inCode = false

  for (const raw of lines) {
    // Bloques de código → descartar
    if (/^```/.test(raw.trim())) { inCode = !inCode; continue }
    if (inCode) continue

    let line = raw

    // Quitar tablas markdown
    if (/^\s*\|.+\|/.test(line)) continue
    // Quitar separadores ---
    if (/^[-_*═]{3,}\s*$/.test(line.trim())) continue

    // Quitar markdown: bold, italic, inline code
    line = line
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
      .replace(/`([^`]+)`/g, "$1")

    // Convertir encabezados markdown solo si son secciones tipo "# ACTO I"
    const headingMatch = line.trim().match(/^#{1,6}\s+(.+)$/)
    if (headingMatch) {
      const txt = headingMatch[1].trim()
      if (/^(ACTO|PARTE|ACT\s|PART\s)/i.test(txt)) {
        result.push(`# ${txt.toUpperCase()}`)
      }
      // Otros encabezados markdown → descartar
      continue
    }

    // Quitar bullets de lista solo al inicio de línea
    line = line.replace(/^(\s*)([-•]\s+)/, "$1")
    // Quitar numeración de lista
    line = line.replace(/^(\s*)(\d+\.\s+)/, "$1")

    // Quitar frases intro/cierre conversacional
    const t = line.trim()
    if (!t) { result.push(""); continue }
    if (/^(aquí (está|tienes|te)|espero|claro,|por supuesto|a continuación|este es|el guion (es|completo)|nota[: ])/i.test(t)) continue

    result.push(line.trimEnd())
  }

  // Colapsar más de 2 líneas vacías consecutivas
  return result
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function looksLikeFountain(text: string): boolean {
  if (!text.trim()) return false
  const lines = text.split("\n").filter(l => l.trim())
  return lines.length >= 3 &&
    /^(INT\.|EXT\.|EST\.|#\s|>\s*(CORTE|FUNDIDO)|\[ESCENOGRAF|\[CAMARA)/im.test(text)
}

/**
 * Integra el output del asistente en el documento Fountain.
 */
export function mergeAssistantFountain(
  action: ChatDocumentAction,
  previousFountain: string,
  assistantText: string
): string {
  if (action === "chat") return previousFountain

  const clean = sanitize(assistantText.trim())
  if (!clean) return previousFountain

  // Enriquecer con etiquetas semánticas automáticamente
  const enriched = enrichFountainWithSemanticTags(clean)

  if (action === "continue") {
    const prev = previousFountain.trimEnd()
    return prev ? `${prev}\n\n${enriched}` : enriched
  }

  // generate / rewrite / refine
  if (!looksLikeFountain(enriched) && previousFountain.trim()) {
    console.warn("[merge] Output no parece Fountain — preservando documento anterior.")
    return previousFountain
  }

  return enriched
}
