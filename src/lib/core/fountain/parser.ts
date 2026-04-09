import { FountainJSON } from "@/types/fountain";
import { FountainTokenizer } from "./tokenizer";

export class FountainParser {
  /**
   * Parsea un string de texto Fountain a un objeto JSON AST.
   */
  public static parse(text: string): FountainJSON {
    // Por ahora, el tokenizer hace el trabajo pesado
    // En el futuro, el parser puede manejar estructuras más complejas como
    // bloques de diálogo dual o metadatos de archivos.
    return FountainTokenizer.tokenize(text);
  }

  /**
   * Convierte un AST de Fountain de vuelta a texto plano.
   */
  public static stringify(ast: FountainJSON): string {
    return ast.map(el => {
      switch (el.type) {
        case "scene_heading": return `.${el.text.toUpperCase()}`;
        case "character": return el.text.toUpperCase();
        case "transition": return `> ${el.text.toUpperCase()}`;
        case "centered": return `> ${el.text} <`;
        case "section": return `# ${el.text}`;
        default: return el.text;
      }
    }).join("\n\n");
  }
}
