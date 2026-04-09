import { FountainElement, CharacterProfile } from "@/types/fountain";

export interface AIRequest {
  action: 'generate' | 'refine' | 'continue' | 'rewrite';
  context: {
    title: string;
    previousScenes: FountainElement[];
    currentScene: FountainElement[] | null;
    characters: CharacterProfile[];
  };
  modifiers: Record<string, any>;
  userInstruction: string;
  model: string; 
}

export class AIOrchestrator {
  /**
   * Construye el prompt completo para enviar al LLM basándose en la acción y el contexto.
   */
  public static buildPrompt(request: AIRequest): string {
    const { action, context, userInstruction, modifiers } = request;
    
    let basePrompt = `Eres un guionista y director de cine experto. Tu tarea es escribir contenido para un guion cinematográfico siguiendo ESTRICTAMENTE el formato Fountain.

REGLAS DE FORMATO:
1. Encabezados de escena: Empiezan con INT. o EXT. (o punto ".") seguido del lugar y tiempo (ej. .INT. CAFETERÍA - DÍA).
2. Personajes: Nombre en MAYÚSCULAS en su propia línea.
3. Diálogo: Inmediatamente debajo del nombre del personaje.
4. Acotaciones (Parentheticals): Entre paréntesis ( ) debajo del personaje antes del diálogo.
5. Transiciones: En MAYÚSCULAS precedidas por ">" (ej. > CORTE A:).

CONTEXTO DEL PROYECTO:
Título: ${context.title || "Sin título"}
Personajes principales: ${context.characters?.length > 0 ? context.characters.map(c => c.name).join(", ") : "No definidos"}

HISTORIAL RECIENTE (Fountain):
${this.formatElements(context.previousScenes)}
`;

    if (context.currentScene && context.currentScene.length > 0) {
      basePrompt += `\nCONTENIDO ACTUAL / SELECCIONADO:\n${this.formatElements(context.currentScene)}`;
    }

    basePrompt += `\n\nINSTRUCCIÓN DEL USUARIO / TAREA:`;

    switch (action) {
      case 'generate':
        return `${basePrompt}\ngenera una nueva escena completa e impactante basada en esta instrucción: "${userInstruction}". Incorpora estos modificadores técnicos si son relevantes: ${JSON.stringify(modifiers)}.`;
      case 'continue':
        return `${basePrompt}\ncontinúa la historia de forma orgánica desde donde se quedó el texto anterior, manteniendo el tono y la voz de los personajes.`;
      case 'refine':
        return `${basePrompt}\nmejora y pule el texto seleccionado ("${userInstruction}") para que sea más cinematográfico, sin perder su esencia ni el formato Fountain.`;
      case 'rewrite':
        return `${basePrompt}\nreescribe la escena actual aplicando este cambio de dirección o estilo: "${userInstruction}".`;
      default:
        return `${basePrompt}\n${userInstruction}`;
    }
  }

  /**
   * Helper para convertir elementos de nuestro AST de vuelta a un formato cuasi-Fountain para el prompt del LLM.
   */
  private static formatElements(elements: FountainElement[]): string {
    if (!elements || elements.length === 0) return "(Sin contexto previo)";
    
    return elements.map(e => {
        switch (e.type) {
            case "scene_heading": return `\n.${e.text.toUpperCase()}`;
            case "character": return `\n${e.text.toUpperCase()}`;
            case "parenthetical": return `(${e.text})`;
            case "transition": return `> ${e.text.toUpperCase()}`;
            default: return e.text;
        }
    }).join("\n");
  }
}
