import { FountainElement, FountainElementType } from "@/types/fountain";

/**
 * Convierte el formato JSON de TipTap/ProseMirror a nuestro AST interno de Fountain.
 * Esto facilita el envío de contexto limpio a la IA.
 */
export function convertTipTapToFountain(json: any): FountainElement[] {
  if (!json || !json.content) return [];

  return json.content.map((node: any) => {
    // TipTap suele envolver el texto en un array 'content'
    const textContent = node.content 
      ? node.content.map((c: any) => c.text || "").join("")
      : "";

    return {
      type: (node.type || "action") as FountainElementType,
      text: textContent,
      metadata: node.attrs || {},
    };
  });
}
