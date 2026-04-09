import { create } from "zustand"

interface UIState {
  outlineOpen: boolean
  toggleOutline: () => void
  /** Mobile: sheet visibility for chat (left) */
  chatOpen: boolean
  /** Mobile: sheet visibility for modifiers (right) */
  modifiersOpen: boolean
  toggleChat: () => void
  toggleModifiers: () => void
  setChatOpen: (open: boolean) => void
  setModifiersOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  outlineOpen: true,
  toggleOutline: () => set((state) => ({ outlineOpen: !state.outlineOpen })),
  chatOpen: false,
  modifiersOpen: false,
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  toggleModifiers: () =>
    set((state) => ({ modifiersOpen: !state.modifiersOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
  setModifiersOpen: (open) => set({ modifiersOpen: open }),
}))
