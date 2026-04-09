import { create } from "zustand";

interface ProjectState {
  projectId: string | null;
  title: string;
  logline: string;
  genre: string;
  content: any; // AST FountainJSON
  
  setProject: (project: any) => void;
  updateTitle: (title: string) => void;
  updateLogline: (logline: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectId: null,
  title: "Nuevo Guion",
  logline: "",
  genre: "DRAMA",
  content: [],
  
  setProject: (project) => set({
    projectId: project.id,
    title: project.title,
    logline: project.logline,
    genre: project.genre,
    content: project.content,
  }),
  
  updateTitle: (title) => set({ title }),
  updateLogline: (logline) => set({ logline }),
}));
