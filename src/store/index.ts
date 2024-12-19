import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Version, Settings, AIConfig } from '@/types';

const MAX_HISTORY_LENGTH = 100;

const defaultSettings: Settings = {
  isDarkMode: false,
  autoSave: true,
  autoSaveInterval: 30000,
};

const defaultAIConfig: AIConfig = {
  apiKey: '',
  model: 'deepseek',
  temperature: 0.7,
};

interface VersionState {
  versions: Version[];
  currentVersion: Version | null;
  selectedTags: string[];
  settings: Settings;
  aiConfig: AIConfig;
  content: string;
  history: {
    undoStack: string[];
    redoStack: string[];
  };
  loadVersions: () => void;
  saveVersion: (content?: string) => void;
  updateContent: (content: string) => void;
  pushToHistory: (content: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  importVersions: (versions: Version[]) => void;
  deleteVersion: (id: string) => void;
  loadVersion: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      versions: [],
      currentVersion: null,
      selectedTags: [],
      settings: defaultSettings,
      aiConfig: defaultAIConfig,
      content: '',
      history: {
        undoStack: [],
        redoStack: [],
      },

      loadVersions: () => {
        const versions = get().versions;
        if (versions.length > 0) {
          set({ currentVersion: versions[0] });
        }
      },

      saveVersion: (content?: string) => {
        const version: Version = {
          id: uuidv4(),
          content: content || get().currentVersion?.content || '',
          timestamp: Date.now(),
          tags: [],
        };
        set(state => ({
          versions: [version, ...state.versions],
          currentVersion: version,
        }));
      },

      updateContent: (content: string) => {
        const state = get();
        const oldContent = state.currentVersion?.content;
        
        // 如果内容没有变化，不需要更新
        if (oldContent === content) return;

        // 更新内容
        set(state => ({
          currentVersion: state.currentVersion
            ? { ...state.currentVersion, content }
            : { id: uuidv4(), content, timestamp: Date.now(), tags: [] },
        }));

        // 将旧内容推入历史记录
        if (oldContent !== undefined) {
          get().pushToHistory?.(oldContent);
        }
      },

      pushToHistory: (content: string) => {
        set((state) => {
          const newUndoStack = [...state.history.undoStack];
          if (newUndoStack.length >= MAX_HISTORY_LENGTH) {
            newUndoStack.shift();
          }
          return {
            history: {
              undoStack: [...newUndoStack, content],
              redoStack: []
            }
          };
        });
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

      importVersions: (versions: Version[]) => {
        set({ 
          versions, 
          currentVersion: versions[0] || null,
          history: {
            undoStack: [],
            redoStack: [],
          },
        });
      },

      deleteVersion: (id: string) => {
        set(state => ({
          versions: state.versions.filter(v => v.id !== id),
          currentVersion:
            state.currentVersion?.id === id
              ? state.versions[0] || null
              : state.currentVersion,
        }));
      },

      loadVersion: (id: string) => {
        set(state => ({
          currentVersion: state.versions.find(v => v.id === id) || state.currentVersion,
          history: {
            undoStack: [],
            redoStack: [],
          },
        }));
      },

      updateSettings: (settings: Partial<Settings>) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      updateAIConfig: (config: Partial<AIConfig>) => {
        set(state => ({
          aiConfig: { ...state.aiConfig, ...config },
        }));
      },

      addTag: (tag: string) => {
        set(state => ({
          selectedTags: [...state.selectedTags, tag],
        }));
      },

      removeTag: (tag: string) => {
        set(state => ({
          selectedTags: state.selectedTags.filter(t => t !== tag),
        }));
      },
    }),
    {
      name: 'ai-markdown-store',
    }
  )
);
