import { create } from "zustand";
import { Editor } from "@tiptap/react";

interface EditorStats {
  pageCount: number
  wordCount: number
  sceneCount: number
  characterNames: string[]
  /** Regla aprox.: 1 página ≈ 250 palabras ≈ 1 min */
  estimatedDuration: string
}

interface EditorState {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  
  isDirty: boolean;
  lastSavedAt: Date | null;
  markDirty: () => void;
  markClean: () => void;
  
  stats: EditorStats;
  updateStats: () => void;
  
  zoom: number;
  setZoom: (zoom: number) => void;
  
  outline: unknown[] // List of scene headings for navigation
}

export const useEditorStore = create<EditorState>((set, get) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
  
  isDirty: false,
  lastSavedAt: null,
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false, lastSavedAt: new Date() }),
  
  stats: {
    pageCount: 1,
    wordCount: 0,
    sceneCount: 0,
    characterNames: [],
    estimatedDuration: "~1 min",
  },
  updateStats: () => {
    const editor = get().editor
    if (!editor) return

    const text = editor.getText()
    const wordCount = text.trim() === "" ? 0 : text.split(/\s+/).length

    let sceneCount = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === "scene_heading") {
        sceneCount++
      }
    })

    const pageCount = Math.max(1, Math.ceil(wordCount / 250))
    const minutes = Math.max(1, Math.round(wordCount / 250))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const estimatedDuration =
      hours > 0 ? `~${hours}h ${mins}m` : `~${mins} min`

    set((state) => ({
      stats: {
        ...state.stats,
        wordCount,
        sceneCount,
        pageCount,
        estimatedDuration,
      },
    }))
  },
  
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  
  outline: [],
}));
