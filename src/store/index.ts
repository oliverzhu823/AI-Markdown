import { create } from 'zustand';
import { EditorState, EditorHistory } from '@/types/editor';

interface VersionState {
  content: string;
  history: EditorHistory;
  versions: any[];
  selectedVersion: any;
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
  aiConfig: {
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  }
};

export const useVersionStore = create<VersionState>((set, get) => ({
  ...initialState,

  // 编辑器状态管理
  setContent: (content: string) => {
    set((state) => ({
      content,
      history: {
        ...state.history,
        undoStack: [...state.history.undoStack, state.content],
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

  // 版本管理
  selectVersion: (version: any) => {
    set({ selectedVersion: version });
  },

  // AI配置
  updateAIConfig: (config: Partial<VersionState['aiConfig']>) => {
    set((state) => ({
      aiConfig: { ...state.aiConfig, ...config }
    }));
  }
}));
