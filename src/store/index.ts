import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, Version, Settings, AIConfig } from '@/types';

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

export const useVersionStore = create<EditorState>()(
  persist(
    (set, get) => ({
      versions: [],
      currentVersion: null,
      selectedTags: [],
      settings: defaultSettings,
      aiConfig: defaultAIConfig,
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
        set(state => {
          const { history } = state;
          if (!history) return state;

          const newUndoStack = [...history.undoStack, content];
          
          // 限制历史记录长度
          if (newUndoStack.length > MAX_HISTORY_LENGTH) {
            newUndoStack.shift();
          }

          return {
            history: {
              undoStack: newUndoStack,
              redoStack: [], // 清空重做栈
            },
          };
        });
      },

      undo: () => {
        set(state => {
          const { currentVersion, history } = state;
          if (!currentVersion || !history || history.undoStack.length === 0) return state;

          const currentContent = currentVersion.content;
          const previousContent = history.undoStack[history.undoStack.length - 1];
          const newUndoStack = history.undoStack.slice(0, -1);

          return {
            currentVersion: {
              ...currentVersion,
              content: previousContent,
            },
            history: {
              undoStack: newUndoStack,
              redoStack: [...history.redoStack, currentContent],
            },
          };
        });
      },

      redo: () => {
        set(state => {
          const { currentVersion, history } = state;
          if (!currentVersion || !history || history.redoStack.length === 0) return state;

          const currentContent = currentVersion.content;
          const nextContent = history.redoStack[history.redoStack.length - 1];
          const newRedoStack = history.redoStack.slice(0, -1);

          return {
            currentVersion: {
              ...currentVersion,
              content: nextContent,
            },
            history: {
              undoStack: [...history.undoStack, currentContent],
              redoStack: newRedoStack,
            },
          };
        });
      },

      clearHistory: () => {
        set(state => ({
          history: {
            undoStack: [],
            redoStack: [],
          },
        }));
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
