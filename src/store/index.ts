import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { EditorState, Version, Settings, AIConfig } from '@/types';

const DEFAULT_SETTINGS: Settings = {
  isDarkMode: false,
  autoSave: true,
  autoSaveInterval: 30000,
};

const DEFAULT_AI_CONFIG: AIConfig = {
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
};

export const useVersionStore = create<EditorState>()(
  persist(
    (set, get) => ({
      versions: [],
      currentVersion: null,
      selectedTags: [],
      settings: DEFAULT_SETTINGS,
      aiConfig: DEFAULT_AI_CONFIG,
      history: {
        undoStack: [],
        redoStack: [],
      },
      content: '',

      loadVersions: () => {
        const versions = localStorage.getItem('versions');
        if (versions) {
          set({ versions: JSON.parse(versions) });
        }
      },

      saveVersion: (content?: string) => {
        const state = get();
        const newVersion: Version = {
          id: uuidv4(),
          content: content || state.content,
          timestamp: Date.now(),
          tags: state.selectedTags,
        };
        set((state) => ({
          versions: [...state.versions, newVersion],
          currentVersion: newVersion,
        }));
      },

      updateContent: (content: string) => {
        set((state) => {
          // 保存当前内容到历史记录
          const undoStack = [...state.history.undoStack, state.content];
          return {
            content,
            history: {
              undoStack,
              redoStack: [],
            },
          };
        });
      },

      importVersions: (versions: Version[]) => {
        set({ versions });
      },

      deleteVersion: (id: string) => {
        set((state) => ({
          versions: state.versions.filter((v) => v.id !== id),
        }));
      },

      loadVersion: (id: string) => {
        const version = get().versions.find((v) => v.id === id);
        if (version) {
          set({ currentVersion: version, content: version.content });
        }
      },

      updateSettings: (settings: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      updateAIConfig: (config: Partial<AIConfig>) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, ...config },
        }));
      },

      addTag: (tag: string) => {
        set((state) => ({
          selectedTags: [...state.selectedTags, tag],
        }));
      },

      removeTag: (tag: string) => {
        set((state) => ({
          selectedTags: state.selectedTags.filter((t) => t !== tag),
        }));
      },

      undo: () => {
        set((state) => {
          if (state.history.undoStack.length === 0) return state;
          const undoStack = [...state.history.undoStack];
          const content = undoStack.pop() || '';
          return {
            content,
            history: {
              undoStack,
              redoStack: [...state.history.redoStack, state.content],
            },
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.history.redoStack.length === 0) return state;
          const redoStack = [...state.history.redoStack];
          const content = redoStack.pop() || '';
          return {
            content,
            history: {
              undoStack: [...state.history.undoStack, state.content],
              redoStack,
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
    }),
    {
      name: 'editor-storage',
    }
  )
);
