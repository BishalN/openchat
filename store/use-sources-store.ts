import { create } from "zustand";
import { devtools } from "zustand/middleware";

// TODO: use the same types as in the backend; fileSize and createdAt are required; keep stuff consistent with agent creation
export interface Source {
  id: string;
  type: "file" | "text" | "website" | "qa" | "notion";
  name: string;
  size?: number;
  content?: string;
  url?: string;
  fileUrl?: string;
  mimeType?: string;
  qaPairs?: { question: string; answer: string }[];
}

interface SourcesState {
  sources: Source[];
  activeTab: "files" | "text" | "website" | "qa" | "notion";
  isUploading: boolean;
  totalSize: number;

  // Actions
  addSource: (source: Source) => void;
  updateSource: (id: string, source: Partial<Source>) => void;
  removeSource: (id: string) => void;
  setIsUploading: (isUploading: boolean) => void;
  resetSources: () => void;
}

export const useSourcesStore = create<SourcesState>()(
  devtools((set) => ({
    sources: [],
    isUploading: false,
    totalSize: 0,

    addSource: (source) =>
      set((state) => ({
        sources: [...state.sources, source],
        totalSize: state.totalSize + (source.size || 0),
      })),

    updateSource: (id, sourceUpdate) =>
      set((state) => ({
        sources: state.sources.map((s) =>
          s.id === id ? { ...s, ...sourceUpdate } : s
        ),
        totalSize: state.sources.reduce((acc, s) => acc + (s.size || 0), 0),
      })),

    removeSource: (id) =>
      set((state) => ({
        sources: state.sources.filter((s) => s.id !== id),
        totalSize: state.sources
          .filter((s) => s.id !== id)
          .reduce((acc, s) => acc + (s.size || 0), 0),
      })),

    setIsUploading: (isUploading) => set({ isUploading }),

    resetSources: () =>
      set({
        sources: [],
        totalSize: 0,
        isUploading: false,
      }),
  }))
);
