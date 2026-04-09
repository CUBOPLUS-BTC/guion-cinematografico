import { enrichFountainWithSemanticTags } from "@/lib/core/ai/semantic-enricher"

export type ChatDocumentAction =
  | "chat"
  | "generate"
  | "continue"
  | "refine"
  | "rewrite"

// Etiquetas de producción válidas — NUNCA eliminar
const VALID_SEMANTIC = /^\[(ESCENOGRAF[IÍ]A|C[AÁ]MARA|SONIDO|M[UÚ]SICA|ILUMINACI[OÓ]N|VFX)\]/i

/**
 * Elimina completamente el markdown y lo convierte a texto Fountain limpio.
 */
function stripMarkdown(text: string): string {
  const lines = text.split(/\r?\n/)
  const out: string[] = []
  let insideCodeBlock = false

  for (const raw of lines) {
    // Saltar bloques de código
    if (/^```/.test(raw.trim())) { insideCodeBlock = !insideCodeBlock; continue }
    if (insideCodeBlock) continue

    let line = raw

    // Saltar líneas de separador markdown (---, ___, ***)
    if (/^[-_*═]{3,}\s*$/.test(line.trim())) continue

    // Saltar tablas markdown
    if (/^\s*\|.+\|/.test(line)) continue

    // Convertir encabezados markdown a texto limpio (no Fountain)
    // # Texto → ignorar (no es un encabezado de escena Fountain)
    // Solo preservar # si parece sección de Fountain (# ACTO I)
    if (/^#{1,6}\s+/.test(line.trim())) {
      const headingText = line.trim().replace(/^#{1,6}\s+/, "").trim()
      // Si es todo mayúsculas o tiene ACTO/ACT, preservar como sección Fountain
      if (/^(ACTO|ACT\s|PARTE\s|PART\s)/i.test(headingText)) {
        out.push(`# ${headingText.toUpperCase()}`)
      }
      // Si no, descartar el encabezado markdown
      continue
    }

    // Eliminar negrita/cursiva markdown
    line = line
      .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/___(.+?)___/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/_(.+?)_/g, "$1")

    // Eliminar backtick inline
    line = line.replace(/`([^`]+)`/g, "$1")

    // Eliminar listas numeradas al inicio de línea (1. texto → texto)
    // pero SOLO si no parece diálogo o acción Fountain
    line = line.replace(/^\s*\d+\.\s+/, "")

    // Eliminar bullets de lista (- texto o • texto) → texto
    line = line.replace(/^\s*[-•]\s+/, "")

    // Eliminar [links](url)
    line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

    // Eliminar líneas que son solo intro/cierre conversacional
    const trimmed = line.trim()
    if (/^(aquí (está|tienes)|espero (que|esto)|claro,|por supuesto,|a continuación)/i.test(trimmed)) continue
    if (/^(este es el guion|el guion es|nota:|nota final)/i.test(trimmed)) continue

    if (trimmed.length > 0) out.push(line.trimEnd())
  }

  return out.join("\n")
}

/**
 * Limpia etiquetas no-Fountain preservando las de producción.
 */
function sanitizeAIOutput(text: string): string {
  // Primero strip de markdown
  const stripped = stripMarkdown(text)

  const lines = stripped.split(/\r?\n/)
  const out: string[] = []

  for (const raw of lines) {
    const line = raw.trim()

    // Preservar etiquetas de producción válidas
    if (VALID_SEMANTIC.test(line)) { out.push(line); continue }

    // Descartar etiquetas no-Fountain
    if (/^\[(ACCIÓN|ACCION|ACTION|TRANSICIÓN|TRANSICION|TRANSITION|ENCABEZADO|HEADING)\]$/.test(line)) continue

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

    if (line.length > 0) out.push(line)
  }

  return out.join("\n")
}

/**
 * Detecta si el texto parece Fountain válido (genérico).
 */
function looksLikeFountain(text: string): boolean {
  if (!text.trim()) return false
  const lines = text.split("\n").filter(l => l.trim())
  if (lines.length < 3) return false
  // Tiene encabezado de escena, sección, etiqueta semántica o transición
  return /^(INT\.|EXT\.|EST\.|#\s|>\s*CORTE|\[ESCENOGRAF|\[CAMARA)/im.test(text)
}

/**
 * Integra la respuesta del asistente en el guion Fountain según la acción.
 * - `chat`: NO modifica el documento.
 * - `continue`: concatena.
 * - `generate`, `rewrite`, `refine`: reemplaza.
 */
export function mergeAssistantFountain(
  action: ChatDocumentAction,
  previousFountain: string,
  assistantText: string
): string {
  if (action === "chat") return previousFountain

  const sanitized = sanitizeAIOutput(assistantText.trim())
  if (!sanitized) return previousFountain

  // Enriquecer con etiquetas semánticas si el modelo no las generó
  const enriched = enrichFountainWithSemanticTags(sanitized)

  if (action === "continue") {
    const prev = previousFountain.trimEnd()
    return prev ? `${prev}\n\n${enriched}` : enriched
  }

  // generate / rewrite / refine
  if (!looksLikeFountain(enriched) && previousFountain.trim()) {
    console.warn("[mergeAssistantFountain] Output no parece Fountain — preservando documento anterior.")
    return previousFountain
  }

  return enriched
}
