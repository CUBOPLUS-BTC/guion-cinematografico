import { FountainElement, FountainElementType } from "@/types/fountain";

export class FountainTokenizer {
  private static readonly SCENE_HEADING_REGEX = /^(INT|EXT|EST|I\/E|INT\.?\/EXT\.?|INT\.|EXT\.)[\s\.]/i;
  private static readonly TRANSITION_REGEX = /^(.*TO:)$|^(>.*)$/;
  private static readonly CHARACTER_REGEX = /^[A-ZÁÉÍÓÚÜÑ0-9\s\(\)\d]+(\s\^)?$/;
  private static readonly PARENTHETICAL_REGEX = /^\(.*\)$/;

  /**
   * Tokeniza un bloque de texto en elementos Fountain básicos.
   * Nota: Este es un parser simplificado para el motor en tiempo real.
   */
  public static tokenize(text: string): FountainElement[] {
    const lines = text.split(/\r?\n/);
    const elements: FountainElement[] = [];
    
    let lastType: FountainElementType | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === "") {
        // Ignorar líneas vacías en el AST crudo o tratarlas como separadores
        lastType = null;
        continue;
      }

      let type: FountainElementType = "action";

      if (this.SCENE_HEADING_REGEX.test(line) || line.startsWith(".")) {
        type = "scene_heading";
      } else if (this.PARENTHETICAL_REGEX.test(line)) {
        type = "parenthetical";
      } else if (this.TRANSITION_REGEX.test(line)) {
        type = "transition";
      } else if (line.startsWith(">") && line.endsWith("<")) {
        type = "centered";
      } else if (line.startsWith("#")) {
        type = "section";
      } else if (this.CHARACTER_REGEX.test(line) && lastType === null) {
        // En Fountain, un personaje debe estar precedido por una línea vacía
        // y ser todo mayúsculas (simplificado aquí como lastType null)
        type = "character";
      } else if (lastType === "character" || lastType === "parenthetical") {
        type = "dialogue";
      }

      elements.push({
        type,
        text: line.startsWith(".") || line.startsWith(">") ? line.substring(1).trim() : line
      });

      lastType = type;
    }

    return elements;
  }
}
