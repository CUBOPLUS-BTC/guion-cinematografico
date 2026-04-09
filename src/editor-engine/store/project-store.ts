import { create } from "zustand";

interface ProjectState {
  projectId: string | null
  title: string
  logline: string
  genre: string
  content: unknown

  setProject: (project: {
    id: string
    title: string
    logline: string
    genre: string
    content: unknown
  }) => void
  updateTitle: (title: string) => void
  updateLogline: (logline: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectId: null,
  title: "Nuevo Guion",
  logline: "",
  genre: "DRAMA",
  content: [],
  
  setProject: (project) =>
    set({
      projectId: project.id,
      title: project.title,
      logline: project.logline,
      genre: project.genre,
      content: project.content,
    }),
  
  updateTitle: (title) => set({ title }),
  updateLogline: (logline) => set({ logline }),
}));
