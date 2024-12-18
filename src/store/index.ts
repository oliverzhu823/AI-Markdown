import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, Version, Settings, AIConfig, EditorHistory } from '@/types';

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

const defaultHistory: EditorHistory = {
  undoStack: [],
  redoStack: [],
};

export const useVersionStore = create<EditorState>()(
  persist(
    (set, get) => ({
      versions: [],
      currentVersion: null,
      selectedTags: [],
      settings: defaultSettings,
      aiConfig: defaultAIConfig,
      history: defaultHistory,
      content: '',

      loadVersions: () => {
        const versions = get().versions;
        if (versions.length > 0) {
          const version = versions[0];
          set({ 
            currentVersion: version,
            content: version.content
          });
        }
      },

      saveVersion: (content?: string) => {
        const currentContent = content || get().content || '';
        const version: Version = {
          id: uuidv4(),
          content: currentContent,
          timestamp: Date.now(),
          tags: [],
        };
        set(state => ({
          versions: [version, ...state.versions],
          currentVersion: version,
          content: currentContent
        }));
      },

      updateContent: (content: string) => {
        const state = get();
        const oldContent = state.content;
        
        // 如果内容没有变化，不需要更新
        if (oldContent === content) return;

        // 更新内容
        set(state => ({
          content,
          currentVersion: state.currentVersion
            ? { ...state.currentVersion, content }
            : { id: uuidv4(), content, timestamp: Date.now(), tags: [] },
        }));

        // 将旧内容推入历史记录
        if (oldContent !== undefined) {
          get().pushToHistory(oldContent);
        }
      },

      pushToHistory: (content: string) => {
        set(state => ({
          history: {
            undoStack: [...state.history.undoStack, content].slice(-MAX_HISTORY_LENGTH),
            redoStack: [], // 清空重做栈
          }
        }));
      },

      undo: () => {
        set(state => {
          const { content, history } = state;
          if (history.undoStack.length === 0) return state;

          const previousContent = history.undoStack[history.undoStack.length - 1];
          const newUndoStack = history.undoStack.slice(0, -1);

          return {
            content: previousContent,
            currentVersion: state.currentVersion
              ? { ...state.currentVersion, content: previousContent }
              : null,
            history: {
              undoStack: newUndoStack,
              redoStack: [...history.redoStack, content],
            },
          };
        });
      },

      redo: () => {
        set(state => {
          const { content, history } = state;
          if (history.redoStack.length === 0) return state;

          const nextContent = history.redoStack[history.redoStack.length - 1];
          const newRedoStack = history.redoStack.slice(0, -1);

          return {
            content: nextContent,
            currentVersion: state.currentVersion
              ? { ...state.currentVersion, content: nextContent }
              : null,
            history: {
              undoStack: [...history.undoStack, content],
              redoStack: newRedoStack,
            },
          };
        });
      },

      clearHistory: () => {
        set({ history: defaultHistory });
      },

      importVersions: (versions: Version[]) => {
        const firstVersion = versions[0] || null;
        set({ 
          versions, 
          currentVersion: firstVersion,
          content: firstVersion?.content || '',
          history: defaultHistory
        });
      },

      deleteVersion: (id: string) => {
        set(state => ({
          versions: state.versions.filter(v => v.id !== id),
          currentVersion: state.currentVersion?.id === id ? null : state.currentVersion,
          content: state.currentVersion?.id === id ? '' : state.content
        }));
      },

      loadVersion: (id: string) => {
        set(state => {
          const version = state.versions.find(v => v.id === id);
          return {
            currentVersion: version || null,
            content: version?.content || ''
          };
        });
      },

      updateSettings: (settings: Partial<Settings>) => {
        set(state => ({
          settings: { ...state.settings, ...settings }
        }));
      },

      updateAIConfig: (config: Partial<AIConfig>) => {
        set(state => ({
          aiConfig: { ...state.aiConfig, ...config }
        }));
      },

      addTag: (tag: string) => {
        set(state => ({
          selectedTags: [...state.selectedTags, tag]
        }));
      },

      removeTag: (tag: string) => {
        set(state => ({
          selectedTags: state.selectedTags.filter(t => t !== tag)
        }));
      },
    }),
    {
      name: 'ai-markdown-store',
    }
  )
);
