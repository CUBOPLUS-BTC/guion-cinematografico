import { create } from "zustand";
import { Editor } from "@tiptap/react";

interface EditorStats {
  pageCount: number;
  wordCount: number;
  sceneCount: number;
  characterNames: string[];
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
  
  outline: any[]; // List of scene headings for navigation
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
  },
  updateStats: () => {
    const editor = get().editor;
    if (!editor) return;

    // Simple heuristic for word count
    const text = editor.getText();
    const wordCount = text.trim() === "" ? 0 : text.split(/\s+/).length;
    
    // Count scene headings
    let sceneCount = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === "scene_heading") {
        sceneCount++;
      }
    });

    set((state) => ({
      stats: {
        ...state.stats,
        wordCount,
        sceneCount,
      }
    }));
  },
  
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  
  outline: [],
}));
