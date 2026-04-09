import { create } from "zustand"
import { FountainParser } from "@/lib/core/fountain/parser"

interface EditorStats {
  pageCount: number
  wordCount: number
  sceneCount: number
  characterNames: string[]
  estimatedDuration: string
}

interface EditorState {
  isDirty: boolean
  lastSavedAt: Date | null
  markDirty: () => void
  markClean: () => void

  stats: EditorStats
  updateStatsFromFountain: (fountainText: string) => void

  outline: unknown[]
}

export const useEditorStore = create<EditorState>((set) => ({
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

  updateStatsFromFountain: (fountainText: string) => {
    const trimmed = fountainText.trim()
    const wordCount = trimmed === "" ? 0 : trimmed.split(/\s+/).length

    let sceneCount = 0
    try {
      const ast = FountainParser.parse(fountainText)
      sceneCount = ast.filter((e) => e.type === "scene_heading").length
    } catch {
      sceneCount = 0
    }

    const pageCount = Math.max(1, Math.ceil(wordCount / 250))
    const minutes = Math.max(1, Math.round(wordCount / 250))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const estimatedDuration =
      hours > 0 ? `~${hours}h ${mins}m` : `~${mins} min`

    set({
      stats: {
        wordCount,
        sceneCount,
        pageCount,
        characterNames: [],
        estimatedDuration,
      },
    })
  },

  outline: [],
}))
