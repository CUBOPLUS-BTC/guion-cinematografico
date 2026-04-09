import type { JSONContent } from "@tiptap/core"

/** Documento TipTap inicial al crear un proyecto (nodos Fountain). */
export const DEFAULT_EDITOR_JSON: JSONContent = {
  type: "doc",
  content: [
    {
      type: "scene_heading",
      content: [{ type: "text", text: "INT. CAFETERIA - DÍA" }],
    },
    {
      type: "action",
      content: [
        {
          type: "text",
          text: "Una pequeña cafetería poco iluminada. Escribe tu historia aquí.",
        },
      ],
    },
    {
      type: "character",
      content: [{ type: "text", text: "PERSONAJE" }],
    },
    {
      type: "dialogue",
      content: [{ type: "text", text: "Tu primer diálogo." }],
    },
  ],
}
