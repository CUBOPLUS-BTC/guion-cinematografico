import { create } from "xmlbuilder2";
import { FountainElement } from "@/types/fountain";

/**
 * Conversor de AST Fountain a formato Final Draft (.fdx).
 * El formato FDX es esencialmente un XML con etiquetas de párrafo específicas.
 */
export class FDXGenerator {
  public static generate(elements: FountainElement[]): string {
    const root = create({ version: "1.0", encoding: "UTF-8" })
      .ele("FinalDraft", { DocumentType: "Script", Version: "1" })
      .ele("Content");

    elements.forEach((el) => {
      const typeMap: Record<string, string> = {
        scene_heading: "Scene Heading",
        action: "Action",
        character: "Character",
        parenthetical: "Parenthetical",
        dialogue: "Dialogue",
        transition: "Transition",
      };

      const fdxType = typeMap[el.type] || "Action";

      root.ele("Paragraph", { Type: fdxType })
          .ele("Text").txt(el.text).up()
          .up();
    });

    return root.end({ prettyPrint: true });
  }
}
