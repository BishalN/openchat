import { create } from "zustand";

// Define interfaces for each source type
interface TextSource {
  type: "text";
  content: string;
  name: string;
  size: number; // in bytes
}

// Update FileSource interface
interface FileSource {
  id: string; // unique identifier
  type: "file";
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
}

interface WebsiteSource {
  type: "website";
  name: string;
  url: string;
}

interface QASource {
  type: "qa";
  name: string;
  qaPairs: Array<{
    question: string;
    answer: string;
  }>;
  size: number; // in bytes
}

interface NotionSource {
  type: "notion";
  name: string;
  url: string;
}

interface SourceStoreState {
  text: TextSource | null;
  file: FileSource[];
  websites: WebsiteSource[];
  qa: QASource | null;
  notion: NotionSource | null;

  // Text source actions
  setTextSource: (content: string, name?: string) => void;

  // Updated File source actions
  setFileSource: (
    fileUrl: string,
    name: string,
    fileSize: number,
    mimeType: string
  ) => void;
  removeFileSource: (id: string) => void;

  // Website source actions
  addWebsiteSource: (url: string, name?: string) => void;
  removeWebsiteSource: (index: number) => void;
  clearWebsiteSources: () => void;

  // QA source actions
  setQASource: (
    qaPairs: Array<{ question: string; answer: string }>,
    name?: string
  ) => void;
  addQAPair: (question: string, answer: string) => void;
  updateQAPair: (index: number, question: string, answer: string) => void;
  removeQAPair: (index: number) => void;

  // Notion source actions
  setNotionSource: (url: string, name?: string) => void;

  // Common actions
  resetSourceData: () => void;
}

export const calculateTextSize = (text: string): number => {
  return new TextEncoder().encode(text).length;
};

export const calculateQASize = (
  qaPairs: Array<{ question: string; answer: string }>
): number => {
  return qaPairs.reduce((total, pair) => {
    return (
      total + calculateTextSize(pair.question) + calculateTextSize(pair.answer)
    );
  }, 0);
};

// Add utility function for generating file ID
const generateFileId = (fileName: string): string => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, "");
  return `${cleanFileName}-${timestamp}`;
};

export const useSourceStore = create<SourceStoreState>()((set, get) => ({
  text: null,
  file: [],
  websites: [],
  qa: null,
  notion: null,

  // Text source actions
  setTextSource: (
    content,
    name = `Text source ${new Date().toLocaleDateString()}`
  ) =>
    set(() => ({
      text: {
        type: "text",
        content,
        name,
        size: calculateTextSize(content),
      },
    })),

  // Updated File source actions
  setFileSource: (fileUrl, name, fileSize, mimeType) =>
    set((state) => ({
      file: [
        ...state.file,
        {
          id: generateFileId(name),
          type: "file",
          name,
          fileUrl,
          fileSize,
          mimeType,
          createdAt: Date.now(),
        },
      ],
    })),

  removeFileSource: (id) =>
    set((state) => ({
      file: state.file.filter((file) => file.id !== id),
    })),

  // Website source actions
  addWebsiteSource: (url, name) =>
    set((state) => ({
      websites: [
        ...state.websites,
        {
          type: "website",
          url,
          name: name || new URL(url).hostname,
        },
      ],
    })),

  removeWebsiteSource: (index) =>
    set((state) => ({
      websites: state.websites.filter((_, i) => i !== index),
    })),

  clearWebsiteSources: () =>
    set(() => ({
      websites: [],
    })),

  // QA source actions
  setQASource: (
    qaPairs,
    name = `QA source ${new Date().toLocaleDateString()}`
  ) =>
    set(() => ({
      qa: {
        type: "qa",
        qaPairs,
        name,
        size: calculateQASize(qaPairs),
      },
    })),

  addQAPair: (question, answer) => {
    const state = get();
    if (state.qa) {
      const newQaPairs = [...state.qa.qaPairs, { question, answer }];
      set({
        qa: {
          ...state.qa,
          qaPairs: newQaPairs,
          size: calculateQASize(newQaPairs),
        },
      });
    }
  },

  updateQAPair: (index, question, answer) => {
    const state = get();
    if (state.qa) {
      const updatedPairs = [...state.qa.qaPairs];
      updatedPairs[index] = { question, answer };

      set({
        qa: {
          ...state.qa,
          qaPairs: updatedPairs,
          size: calculateQASize(updatedPairs),
        },
      });
    }
  },

  removeQAPair: (index) => {
    const state = get();
    if (state.qa) {
      const filteredPairs = state.qa.qaPairs.filter((_, i) => i !== index);
      set({
        qa: {
          ...state.qa,
          qaPairs: filteredPairs,
          size: calculateQASize(filteredPairs),
        },
      });
    }
  },

  // Notion source actions
  setNotionSource: (
    url,
    name = `Notion source ${new Date().toLocaleDateString()}`
  ) =>
    set(() => ({
      notion: {
        type: "notion",
        url,
        name,
      },
    })),

  resetSourceData: () =>
    set({
      text: null,
      file: [],
      websites: [],
      qa: null,
      notion: null,
    }),
}));
