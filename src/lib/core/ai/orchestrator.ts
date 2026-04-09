import { FountainElement, CharacterProfile } from "@/types/fountain";

export interface AIRequest {
  action: 'generate' | 'refine' | 'continue' | 'rewrite';
  context: {
    title: string;
    logline?: string;
    synopsis?: string;
    previousScenes: FountainElement[];
    currentScene: FountainElement[] | null;
    characters: CharacterProfile[];
  };
  modifiers: Record<string, unknown>;
  userInstruction: string;
  model: string;
}

export interface OrchestratorResult {
  fountain: string;
  isValid: boolean;
  warnings: string[];
}

export class AIOrchestrator {

  // ─── PROMPT BUILDER ────────────────────────────────────────────────────────

  public static buildPrompt(request: AIRequest): string {
    const { action, context, userInstruction, modifiers } = request;

    const synopsisBlock = [
      context.logline?.trim() ? `LOGLINE: ${context.logline.trim()}` : "",
      context.synopsis?.trim() ? `SINOPSIS: ${context.synopsis.trim()}` : "",
    ].filter(Boolean).join("\n")

    // Regla 0 — CRÍTICA: forzar al modelo a NO usar markdown
    const noMarkdownRule = `
════════════════════════════════════════
⚠️  REGLA CRÍTICA — LEE ANTES DE RESPONDER:
Tu respuesta DEBE ser ÚNICAMENTE texto en formato Fountain.
PROHIBIDO ABSOLUTAMENTE:
  ✗ Asteriscos o negrita (**texto** o *texto*)
  ✗ Encabezados markdown (# título)
  ✗ Listas con guiones o números (- item / 1. item)
  ✗ Bloques de código (\`\`\` o \`)
  ✗ Tablas markdown (| col | col |)
  ✗ Cursiva (_texto_)
  ✗ Explicaciones, introducciones o comentarios fuera del guion
  ✗ Frases como "Aquí está el guion:" o "Espero que sea útil"
SOLO texto Fountain puro. Nada más.
════════════════════════════════════════
`

    const fountainRules = `
FORMATO FOUNTAIN — REGLAS EXACTAS:
1. Encabezados de escena: INT. LOCACIÓN - MOMENTO  (ej: INT. TALLER - TARDE)
2. Personajes: NOMBRE EN MAYÚSCULAS solo en su línea  (ej: SATOSHI)
3. Diálogo: línea siguiente al personaje, sin sangría
4. Acotación: (entre paréntesis) debajo del personaje, antes del diálogo
5. Transición: > CORTE A:   o   > FUNDIDO A NEGRO.
6. Texto centrado (títulos finales): > TEXTO <
7. Timing: [[Duración: ~0:00–0:30]]
8. Sección/acto: # ACTO I

ETIQUETAS SEMÁNTICAS OBLIGATORIAS (van en líneas de acción):
[ESCENOGRAFIA] descripción del espacio, atmósfera, objetos (al inicio de cada escena)
[CAMARA] plano, movimiento, lente  (PLANO GENERAL, CLOSE-UP, DOLLY, RACK FOCUS...)
[SONIDO] efectos, ambiente, silencios
[MUSICA] estilo, intensidad, momento emocional
→ Incluir SIEMPRE al menos [ESCENOGRAFIA] y [CAMARA] por escena.
`

    const contextBlock = `
PROYECTO:
Título: ${context.title || "Sin título"}
${synopsisBlock}
Personajes: ${context.characters?.length > 0 ? context.characters.map(c => c.name).join(", ") : "No definidos"}

MODIFICADORES DE PRODUCCIÓN:
${JSON.stringify(modifiers ?? {}, null, 2)}

GUION ACTUAL (Fountain):
${this.formatElements(context.previousScenes) || "(documento vacío)"}
`

    const currentBlock = context.currentScene?.length
      ? `\nESCENA EN FOCO:\n${this.formatElements(context.currentScene)}\n`
      : ""

    // Instrucción específica por acción
    let actionInstruction = ""
    switch (action) {
      case 'generate':
        actionInstruction = `Genera una escena nueva completa con todas las etiquetas semánticas.
Instrucción: "${userInstruction || "genera una escena cinematográfica impactante"}"
RECUERDA: SOLO Fountain puro. Empieza DIRECTAMENTE con INT. o EXT.`
        break
      case 'continue':
        actionInstruction = `Continúa el guion desde el último beat sin repetir lo ya escrito.
Mantén el tono, los personajes y agrega etiquetas [CAMARA] y [SONIDO].
RECUERDA: SOLO Fountain puro. Continúa desde donde terminó el guion.`
        break
      case 'refine':
        actionInstruction = `Refina el guion haciéndolo más cinematográfico y visual.
Enriquece con etiquetas [CAMARA], [SONIDO], [ESCENOGRAFIA] donde falten.
Instrucción: "${userInstruction || "refina el guion"}"
RECUERDA: Devuelve el guion COMPLETO refinado en Fountain puro.`
        break
      case 'rewrite':
        actionInstruction = `Reescribe el guion aplicando este cambio: "${userInstruction}"
Renueva el tratamiento visual con nuevas etiquetas semánticas.
RECUERDA: Devuelve el guion COMPLETO reescrito en Fountain puro.`
        break
    }

    return `${noMarkdownRule}${fountainRules}${contextBlock}${currentBlock}
TAREA (${action.toUpperCase()}):
${actionInstruction}

⚠️  RECUERDA: Tu respuesta debe empezar DIRECTAMENTE con el texto Fountain. Sin introducción. Sin markdown. Sin explicaciones.`
  }

  // ─── VALIDADOR ─────────────────────────────────────────────────────────────

  public static validateOutput(text: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = []
    const t = text.trim()

    if (!t) return { isValid: false, warnings: ["Respuesta vacía."] }

    if (/\*\*/.test(t)) warnings.push("Output contiene markdown bold (**). Será limpiado.")
    if (/^#{1,6}\s/m.test(t)) warnings.push("Output contiene encabezados markdown. Será limpiado.")
    if (/^\|.+\|/m.test(t)) warnings.push("Output contiene tablas markdown. Será limpiado.")
    if (/^```/m.test(t)) warnings.push("Output contiene bloques de código. Será limpiado.")

    const hasSceneHeading = /^(INT\.|EXT\.|EST\.)/im.test(t)
    if (!hasSceneHeading) warnings.push("No se detectó encabezado de escena INT./EXT.")

    const hasSemanticTag = /\[(ESCENOGRAFIA|CAMARA|SONIDO|MUSICA)/i.test(t)
    if (!hasSemanticTag) warnings.push("Sin etiquetas semánticas — el enriquecedor las añadirá.")

    return {
      isValid: hasSceneHeading && t.split("\n").filter(l => l.trim()).length >= 3,
      warnings,
    }
  }

  // ─── HELPER ────────────────────────────────────────────────────────────────

  public static formatElements(elements: FountainElement[]): string {
    if (!elements?.length) return "(Sin contexto previo)"
    return elements.map(e => {
      switch (e.type) {
        case "scene_heading": return `\n${e.text.toUpperCase()}`
        case "character":     return `\n${e.text.toUpperCase()}`
        case "parenthetical": return `(${e.text})`
        case "transition":    return `> ${e.text.toUpperCase()}`
        case "note":          return `[[${e.text}]]`
        default:              return e.text
      }
    }).join("\n")
  }
}
