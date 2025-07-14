import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { InsertAgent, InsertSource, sourceTypeEnum } from "@/drizzle/schema";

interface AgentCreationState {
  // Agent data
  agent: Partial<InsertAgent>;

  // Sources data
  sources: Partial<InsertSource>[];

  // UI state
  currentStep: "info" | "source" | "review";

  // Actions for agent
  setAgentName: (name: string) => void;
  setAgentDescription: (description: string) => void;
  setAgentIsPublic: (isPublic: boolean) => void;

  // Actions for sources
  addSource: (source: Partial<InsertSource>) => void;
  updateSource: (index: number, source: Partial<InsertSource>) => void;
  removeSource: (index: number) => void;

  // Navigation actions
  setCurrentStep: (step: "info" | "source" | "review") => void;

  // Reset state
  reset: () => void;
}

// Initial state
const initialState = {
  agent: {
    name: "",
    description: "",
    isPublic: false,
  },
  sources: [],
  currentStep: "info" as const,
};

export const useAgentCreation = create<AgentCreationState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Agent actions
        setAgentName: (name: string) =>
          set((state) => ({ agent: { ...state.agent, name } })),

        setAgentDescription: (description: string) =>
          set((state) => ({ agent: { ...state.agent, description } })),

        setAgentIsPublic: (isPublic: boolean) =>
          set((state) => ({ agent: { ...state.agent, isPublic } })),

        // Source actions
        addSource: (source: Partial<InsertSource>) =>
          set((state) => ({ sources: [...state.sources, source] })),

        updateSource: (index: number, source: Partial<InsertSource>) =>
          set((state) => ({
            sources: state.sources.map((s, i) =>
              i === index ? { ...s, ...source } : s
            ),
          })),

        removeSource: (index: number) =>
          set((state) => ({
            sources: state.sources.filter((_, i) => i !== index),
          })),

        // Navigation actions
        setCurrentStep: (currentStep) => set({ currentStep }),

        // Reset action
        reset: () => set(initialState),
      }),
      {
        name: "agent-creation-storage",
      }
    )
  )
);
