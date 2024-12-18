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

export interface TextRange {
  start: number;
  end: number;
  text: string;
}

export interface EditorHistory {
  undoStack: string[];
  redoStack: string[];
}

export interface EditorState {
  versions: Version[];
  currentVersion: Version | null;
  selectedTags: string[];
  settings: Settings;
  aiConfig: AIConfig;
  history: EditorHistory;
  content: string;
  loadVersions: () => void;
  saveVersion: (content?: string) => void;
  updateContent: (content: string) => void;
  importVersions: (versions: Version[]) => void;
  deleteVersion: (id: string) => void;
  loadVersion: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  undo: () => void;
  redo: () => void;
  pushToHistory: (content: string) => void;
  clearHistory: () => void;
}
