import { create } from "zustand"
import { mergeAssistantFountain, type ChatDocumentAction } from "@/lib/core/ai/chat-document"
import { fountainStringToProjectContent } from "@/lib/core/fountain/project-content"

interface ChatStoreState {
  documentFountain: string
  isDirty: boolean
  pendingAction: ChatDocumentAction
  streamingPreview: string | null

  setDocumentFountain: (value: string, options?: { markDirty?: boolean }) => void
  /** Tras respuesta del asistente: fusiona texto en el documento y marca sucio. */
  applyAssistantOutput: (assistantText: string, action: ChatDocumentAction) => void
  setPendingAction: (action: ChatDocumentAction) => void
  setStreamingPreview: (value: string | null) => void
  markClean: () => void
  markDirty: () => void
  /** Payload guardado en API (JSON). */
  getProjectContentPayload: () => ReturnType<typeof fountainStringToProjectContent>
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  documentFountain: "",
  isDirty: false,
  pendingAction: "chat",
  streamingPreview: null,

  setDocumentFountain: (value, options) =>
    set({
      documentFountain: value,
      isDirty: options?.markDirty ?? true,
    }),

  applyAssistantOutput: (assistantText, action) => {
    const prev = get().documentFountain
    const merged = mergeAssistantFountain(action, prev, assistantText)
    set({
      documentFountain: merged,
      isDirty: true,
      streamingPreview: null,
    })
  },

  setPendingAction: (pendingAction) => set({ pendingAction }),
  setStreamingPreview: (streamingPreview) => set({ streamingPreview }),

  markClean: () => set({ isDirty: false }),
  markDirty: () => set({ isDirty: true }),

  getProjectContentPayload: () => fountainStringToProjectContent(get().documentFountain),
}))
