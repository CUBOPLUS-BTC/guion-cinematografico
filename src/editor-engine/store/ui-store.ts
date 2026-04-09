import { create } from "zustand";

interface UIState {
  outlineOpen: boolean;
  pluginsOpen: boolean;
  toggleOutline: () => void;
  togglePlugins: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  outlineOpen: true,
  pluginsOpen: true,
  toggleOutline: () => set((state) => ({ outlineOpen: !state.outlineOpen })),
  togglePlugins: () => set((state) => ({ pluginsOpen: !state.pluginsOpen })),
}));
