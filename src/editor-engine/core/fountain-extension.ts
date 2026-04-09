import { Extension } from "@tiptap/core";
import { Action, Character, Dialogue, Parenthetical, SceneHeading, Transition } from "./schema";

export const FountainExtension = Extension.create({
  name: "fountain",

  addExtensions() {
    return [
      SceneHeading,
      Action,
      Character,
      Dialogue,
      Parenthetical,
      Transition,
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.setNode("scene_heading"),
      "Mod-Shift-c": () => this.editor.commands.setNode("character"),
      "Mod-Shift-d": () => this.editor.commands.setNode("dialogue"),
      "Mod-Shift-p": () => this.editor.commands.setNode("parenthetical"),
      "Mod-Shift-a": () => this.editor.commands.setNode("action"),
      "Mod-Shift-t": () => this.editor.commands.setNode("transition"),
      "Enter": ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;
        const node = $from.parent;

        // Lógica de continuación automática:
        // Si estamos en un Personaje, la siguiente línea debería ser Diálogo.
        if (node.type.name === "character") {
          return editor.commands.insertContent({ type: "dialogue" });
        }
        // Si estamos en Diálogo, la siguiente línea debería ser Acción (o otro Personaje, pero Acción es el default).
        if (node.type.name === "dialogue") {
          return editor.commands.insertContent({ type: "character" });
        }
        // Si estamos en Acotación, la siguiente línea debería ser Diálogo.
        if (node.type.name === "parenthetical") {
          return editor.commands.insertContent({ type: "dialogue" });
        }

        return false; // Deja que el comportamiento por defecto de Enter ocurra
      },
    };
  },
});
