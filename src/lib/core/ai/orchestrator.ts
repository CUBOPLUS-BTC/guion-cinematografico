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

    // Bloque de sinopsis/logline al inicio si existen
    let synopsisBlock = ""
    if (context.logline?.trim()) {
      synopsisBlock += `LOGLINE: ${context.logline.trim()}\n`
    }
    if (context.synopsis?.trim()) {
      synopsisBlock += `SINOPSIS: ${context.synopsis.trim()}\n`
    }

    let basePrompt = `Eres un guionista y director de cine experto. Tu tarea es escribir contenido para un guion cinematográfico siguiendo ESTRICTAMENTE el formato Fountain con etiquetas semánticas de producción.

REGLAS DE FORMATO FOUNTAIN:
1. Encabezados de escena: INT. o EXT. LOCACIÓN - MOMENTO (ej. INT. TALLER - TARDE)
2. Personajes: nombre en MAYÚSCULAS en su propia línea
3. Diálogo: inmediatamente debajo del personaje
4. Acotaciones: entre paréntesis (ej. (susurro))
5. Transiciones: > CORTE A: o > FUNDIDO A NEGRO.
6. Texto centrado (títulos): > TEXTO <
7. Notas de timing: [[Duración: ~0:00–0:30]]

ETIQUETAS SEMÁNTICAS DE PRODUCCIÓN (usar en líneas de acción):
- [ESCENOGRAFIA] descripción detallada del espacio, objetos, época, atmósfera
- [CAMARA] plano, movimiento, lente, ritmo (PLANO GENERAL, CLOSE-UP, DOLLY, etc.)
- [SONIDO] efectos de sonido, ambiente, silencios, off-screen
- [MUSICA] estilo, intensidad, momento emocional
- Siempre incluir al menos [ESCENOGRAFIA] y [CAMARA] por escena.

CONTEXTO DEL PROYECTO:
Título: ${context.title || "Sin título"}
${synopsisBlock}Personajes: ${context.characters?.length > 0 ? context.characters.map(c => c.name).join(", ") : "No definidos"}

MODIFICADORES TÉCNICOS:
${JSON.stringify(modifiers ?? {}, null, 2)}

HISTORIAL RECIENTE (Fountain):
${this.formatElements(context.previousScenes)}
`;

    if (context.currentScene && context.currentScene.length > 0) {
      basePrompt += `\nESCENA ACTUAL:\n${this.formatElements(context.currentScene)}\n`;
    }

    basePrompt += `\nINSTRUCCIÓN:`;

    switch (action) {
      case 'generate':
        return `${basePrompt}
Genera una escena nueva completa en formato Fountain con etiquetas semánticas.
Instrucción específica: "${userInstruction}"
IMPORTANTE: Responde SOLO con el texto Fountain — sin explicaciones, sin markdown extra.`;

      case 'continue':
        return `${basePrompt}
Continúa la historia desde donde termina el historial de forma orgánica.
Mantén el tono, los personajes y el formato Fountain con etiquetas semánticas.
IMPORTANTE: Responde SOLO con el texto Fountain a partir del siguiente beat narrativo.`;

      case 'refine':
        return `${basePrompt}
Mejora y pule el contenido para que sea más cinematográfico y preciso.
Instrucción de refinamiento: "${userInstruction}"
Conserva la estructura Fountain y enriquece las etiquetas [CAMARA], [SONIDO], [ESCENOGRAFIA].
IMPORTANTE: Devuelve el guion completo refinado en Fountain.`;

      case 'rewrite':
        return `${basePrompt}
Reescribe la escena aplicando este cambio de dirección: "${userInstruction}"
Mantén el arco narrativo pero renueva el tratamiento visual y sonoro.
IMPORTANTE: Devuelve el guion completo reescrito en Fountain.`;

      default:
        return `${basePrompt}\n${userInstruction}`;
    }
  }

  // ─── VALIDADOR DE OUTPUT ───────────────────────────────────────────────────

  /**
   * Valida que el texto generado por la IA sea Fountain válido.
   * Retorna warnings si falta estructura esencial.
   */
  public static validateOutput(text: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = []
    const t = text.trim()

    if (!t) {
      return { isValid: false, warnings: ["La IA devolvió una respuesta vacía."] }
    }

    // Debe tener al menos un encabezado de escena
    const hasSceneHeading = /^(INT\.|EXT\.|EST\.)/im.test(t)
    if (!hasSceneHeading) {
      warnings.push("No se detectó encabezado de escena (INT./EXT.).")
    }

    // Recomendar etiquetas semánticas si no hay ninguna
    const hasSemanticTag = /\[(ESCENOGRAFIA|CAMARA|SONIDO|MUSICA)/i.test(t)
    if (!hasSemanticTag) {
      warnings.push("Sin etiquetas de producción [CAMARA]/[ESCENOGRAFIA]. Considera usar Refinar.")
    }

    // Mínimo de contenido (más de 3 líneas)
    const lines = t.split("\n").filter(l => l.trim())
    if (lines.length < 3) {
      warnings.push("El contenido generado es muy corto.")
    }

    return {
      isValid: hasSceneHeading && lines.length >= 3,
      warnings,
    }
  }

  // ─── HELPER ────────────────────────────────────────────────────────────────

  public static formatElements(elements: FountainElement[]): string {
    if (!elements || elements.length === 0) return "(Sin contexto previo)"

    return elements.map(e => {
      switch (e.type) {
        case "scene_heading": return `\nINT.${e.text.toUpperCase()}`
        case "character":     return `\n${e.text.toUpperCase()}`
        case "parenthetical": return `(${e.text})`
        case "transition":    return `> ${e.text.toUpperCase()}`
        case "note":          return `[[${e.text}]]`
        default:              return e.text
      }
    }).join("\n")
  }
}
