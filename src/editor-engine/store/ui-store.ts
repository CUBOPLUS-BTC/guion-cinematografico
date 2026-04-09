import { create } from "zustand"

interface UIState {
  outlineOpen: boolean
  toggleOutline: () => void
}

export const useUIStore = create<UIState>((set) => ({
  outlineOpen: true,
  toggleOutline: () => set((state) => ({ outlineOpen: !state.outlineOpen })),
}))
