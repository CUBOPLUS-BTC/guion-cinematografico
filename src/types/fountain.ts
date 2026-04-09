export type FountainElementType =
  | "scene_heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "note"
  | "section"
  | "synopsis"
  | "centered"
  | "page_break";

export interface FountainElement {
  type: FountainElementType;
  text: string;
  metadata?: Record<string, unknown>;
}

/** Etiquetas para bloques de acción / notas con significado de producción. */
export type FountainSemanticTag =
  | "scenography" // [ESCENOGRAFIA]
  | "sound" // [SONIDO]
  | "music" // [MUSICA]
  | "camera" // [CAMARA]
  | "time" // [[Duracion: ...]]
  | "none";

/** Bloque con id estable para edición en el editor por bloques. */
export interface FountainBlock extends FountainElement {
  id: string;
  semanticTag: FountainSemanticTag;
}

export type FountainJSON = FountainElement[];

export interface CharacterProfile {
  name: string;
  description?: string;
  scenes: number[]; // Indices of scenes they appear in
}
