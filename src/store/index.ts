import { create } from 'zustand';
import { EditorState, EditorHistory } from '@/types/editor';

interface VersionState {
  aiConfig: {
    model: string;
    apiKey: string;
    temperature: number;
  };
}

const DEFAULT_SETTINGS = {
  theme: 'github',
  fontSize: 14,
  lineHeight: 1.5,
  tabSize: 2,
};

const DEFAULT_HISTORY: EditorHistory = {
  undoStack: [],
  redoStack: [],
};

export const useVersionStore = create<EditorState & VersionState>((set, get) => ({
  content: '',
  history: DEFAULT_HISTORY,
  settings: DEFAULT_SETTINGS,
  tags: [],
  aiConfig: {
    model: import.meta.env.VITE_DEFAULT_AI_MODEL || 'gpt-3.5-turbo',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
    temperature: parseFloat(import.meta.env.VITE_DEFAULT_AI_TEMPERATURE || '0.7'),
  },

  // 编辑器内容管理
  setContent: (content: string) => {
    const currentState = get();
    currentState.pushToHistory(currentState.content);
    set({ content });
  },

  // 历史记录管理
  pushToHistory: (content: string) => {
    set((state) => ({
      history: {
        undoStack: [...state.history.undoStack, content],
        redoStack: [],
      },
    }));
  },

  undo: () => {
    set((state) => {
      const { undoStack, redoStack } = state.history;
      if (undoStack.length === 0) return state;

      const newContent = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      const newRedoStack = [state.content, ...redoStack];

      return {
        content: newContent,
        history: {
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        },
      };
    });
  },

  redo: () => {
    set((state) => {
      const { undoStack, redoStack } = state.history;
      if (redoStack.length === 0) return state;

      const newContent = redoStack[0];
      const newRedoStack = redoStack.slice(1);
      const newUndoStack = [...undoStack, state.content];

      return {
        content: newContent,
        history: {
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        },
      };
    });
  },

  clearHistory: () => {
    set({
      history: {
        undoStack: [],
        redoStack: [],
      },
    });
  },

  // 设置管理
  updateSettings: (settings: Partial<typeof DEFAULT_SETTINGS>) => {
    set((state) => ({
      settings: { ...state.settings, ...settings },
    }));
  },

  // 标签管理
  addTag: (tag: string) => {
    set((state) => ({
      tags: [...state.tags, tag],
    }));
  },

  removeTag: (tag: string) => {
    set((state) => ({
      tags: state.tags.filter((t) => t !== tag),
    }));
  },

  // AI配置管理
  updateAIConfig: (config: Partial<VersionState['aiConfig']>) => {
    set((state) => ({
      aiConfig: { ...state.aiConfig, ...config },
    }));
  },

  // 获取当前内容
  get: () => get().content,
}));
