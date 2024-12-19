import { create } from 'zustand';
import { EditorState, EditorHistory } from '@/types/editor';

interface Version {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  tags: string[];
}

interface VersionState {
  content: string;
  history: EditorHistory;
  versions: Version[];
  selectedVersion: Version | null;
  selectedTags: string[];
  autoSave: boolean;
  aiConfig: {
    model: string;
    temperature: number;
  };
}

const initialState: VersionState = {
  content: '',
  history: {
    undoStack: [],
    redoStack: []
  },
  versions: [],
  selectedVersion: null,
  selectedTags: [],
  autoSave: true,
  aiConfig: {
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  }
};

export const useVersionStore = create<EditorState & VersionState>((set, get) => ({
  ...initialState,

  // Editor state management
  content: '',
  history: initialState.history,
  get: () => get().content,

  setContent: (content: string) => {
    set((state) => {
      state.pushToHistory(state.content);
      return { content };
    });
  },

  pushToHistory: (content: string) => {
    set((state) => ({
      history: {
        undoStack: [...state.history.undoStack, content],
        redoStack: []
      }
    }));
  },

  undo: () => {
    set((state) => {
      const { undoStack, redoStack } = state.history;
      if (undoStack.length === 0) return state;

      const newContent = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      const newRedoStack = [...redoStack, state.content];

      return {
        content: newContent,
        history: {
          undoStack: newUndoStack,
          redoStack: newRedoStack
        }
      };
    });
  },

  redo: () => {
    set((state) => {
      const { undoStack, redoStack } = state.history;
      if (redoStack.length === 0) return state;

      const newContent = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      const newUndoStack = [...undoStack, state.content];

      return {
        content: newContent,
        history: {
          undoStack: newUndoStack,
          redoStack: newRedoStack
        }
      };
    });
  },

  clearHistory: () => {
    set({
      history: {
        undoStack: [],
        redoStack: []
      }
    });
  },

  // Version management
  versions: initialState.versions,
  selectedVersion: initialState.selectedVersion,
  selectedTags: initialState.selectedTags,
  
  selectVersion: (version: Version) => {
    set({ selectedVersion: version });
  },

  addTag: (tag: string) => {
    set((state) => ({
      selectedTags: [...state.selectedTags, tag]
    }));
  },

  removeTag: (tag: string) => {
    set((state) => ({
      selectedTags: state.selectedTags.filter(t => t !== tag)
    }));
  },

  // Auto save
  autoSave: initialState.autoSave,
  autoSaveContent: (content: string) => {
    if (!get().autoSave) return;
    const version: Version = {
      id: Date.now().toString(),
      title: '自动保存',
      content,
      timestamp: Date.now(),
      tags: ['auto-save']
    };
    set((state) => ({
      versions: [...state.versions, version]
    }));
  },

  // AI configuration
  aiConfig: initialState.aiConfig,
  
  updateAIConfig: (config: Partial<VersionState['aiConfig']>) => {
    set((state) => ({
      aiConfig: { ...state.aiConfig, ...config }
    }));
  }
}));
