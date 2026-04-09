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

export type FountainJSON = FountainElement[];

export interface CharacterProfile {
  name: string;
  description?: string;
  scenes: number[]; // Indices of scenes they appear in
}
