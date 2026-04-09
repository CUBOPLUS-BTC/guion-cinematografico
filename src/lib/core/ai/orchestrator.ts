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

export class AIOrchestrator {

  public static buildPrompt(request: AIRequest): string {
    const { action, context, userInstruction } = request;

    const prev = this.formatElements(context.previousScenes)
    const chars = context.characters?.map(c => c.name).join(", ") || ""
    const logline = context.logline?.trim() ? `Logline: ${context.logline}` : ""
    const synopsis = context.synopsis?.trim() ? `Sinopsis: ${context.synopsis}` : ""

    const system = `Eres un guionista de cine. Escribe SOLO en formato Fountain. Sin markdown.

FORMATO:
- Escena: INT. LUGAR - MOMENTO
- Acción: párrafo normal
- Personaje: NOMBRE EN MAYÚSCULAS
- Diálogo: línea siguiente al personaje
- Transición: > CORTE A:

PROYECTO: ${context.title}
${logline}
${synopsis}
${chars ? `Personajes: ${chars}` : ""}

GUION ACTUAL:
${prev || "(vacío)"}
`

    const tasks: Record<string, string> = {
      generate: `Escribe una escena nueva. Instrucción: "${userInstruction || "escena cinematográfica impactante"}". Empieza con INT. o EXT.`,
      continue:  `Continúa el guion desde donde termina. Sin repetir lo anterior.`,
      refine:    `Mejora el guion haciéndolo más visual y cinematográfico. Devuelve el guion completo mejorado.`,
      rewrite:   `Reescribe el guion aplicando: "${userInstruction}". Devuelve el guion completo.`,
    }

    return `${system}\nTAREA: ${tasks[action] ?? userInstruction}\n\nResponde SOLO con el texto del guion. Sin introducción ni comentarios.`
  }

  public static validateOutput(text: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = []
    const t = text.trim()
    if (!t) return { isValid: false, warnings: ["Respuesta vacía."] }
    if (/\*\*/.test(t)) warnings.push("Contiene markdown bold.")
    if (/^```/m.test(t)) warnings.push("Contiene bloques de código.")
    const hasScene = /^(INT\.|EXT\.|EST\.)/im.test(t)
    if (!hasScene) warnings.push("Sin encabezado de escena.")
    return { isValid: hasScene, warnings }
  }

  public static formatElements(elements: FountainElement[]): string {
    if (!elements?.length) return ""
    return elements.slice(-30).map(e => {
      switch (e.type) {
        case "scene_heading": return `\n${e.text.toUpperCase()}`
        case "character":     return `\n${e.text.toUpperCase()}`
        case "parenthetical": return `(${e.text})`
        case "transition":    return `> ${e.text.toUpperCase()}`
        default:              return e.text
      }
    }).join("\n")
  }
}
