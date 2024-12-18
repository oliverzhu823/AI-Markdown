export interface Version {
  id: string;
  content: string;
  timestamp: number;
  tags: string[];
}

export interface Settings {
  isDarkMode: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface EditorState {
  versions: Version[];
  currentVersion: Version | null;
  selectedTags: string[];
  settings: Settings;
  aiConfig: AIConfig;
  history?: {
    undoStack: string[];
    redoStack: string[];
  };

  // 版本管理
  loadVersions: () => void;
  saveVersion: (content?: string) => void;
  updateContent: (content: string) => void;
  importVersions: (versions: Version[]) => void;
  deleteVersion: (id: string) => void;
  loadVersion: (id: string) => void;

  // 历史记录
  undo?: () => void;
  redo?: () => void;
  pushToHistory?: (content: string) => void;
  clearHistory?: () => void;

  // 设置
  updateSettings: (settings: Partial<Settings>) => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;

  // 标签
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}
