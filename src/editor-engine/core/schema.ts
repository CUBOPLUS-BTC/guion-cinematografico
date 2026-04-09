import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Nodo para Scene Headings (INT. / EXT.)
 */
export const SceneHeading = Node.create({
  name: "scene_heading",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="scene_heading"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "scene_heading", class: "fountain-scene-heading uppercase font-bold mt-6 mb-2" }), 0];
  },
});

/**
 * Nodo para Personajes
 */
export const Character = Node.create({
  name: "character",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="character"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "character", class: "fountain-character uppercase text-center w-[60%] mx-auto mt-4" }), 0];
  },
});

/**
 * Nodo para Diálogos
 */
export const Dialogue = Node.create({
  name: "dialogue",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="dialogue"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "dialogue", class: "fountain-dialogue text-center w-[70%] mx-auto mb-2" }), 0];
  },
});

/**
 * Nodo para Acotaciones (Parentheticals)
 */
export const Parenthetical = Node.create({
  name: "parenthetical",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="parenthetical"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "parenthetical", class: "fountain-parenthetical italic text-center w-[50%] mx-auto" }), 0];
  },
});

/**
 * Nodo para Acción (Descripción)
 */
export const Action = Node.create({
  name: "action",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="action"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "action", class: "fountain-action mt-2 mb-2" }), 0];
  },
});

/**
 * Nodo para Transiciones
 */
export const Transition = Node.create({
  name: "transition",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="transition"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "transition", class: "fountain-transition uppercase text-right mt-4 mb-4" }), 0];
  },
});
