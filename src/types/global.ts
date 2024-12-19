// 编辑器状态类型
export interface EditorState {
  content: string;
  selection: TextRange | null;
  history: {
    undoStack: string[];
    redoStack: string[];
    canUndo: boolean;
    canRedo: boolean;
    push: (state: string) => void;
    undo: () => void;
    redo: () => void;
  };
}

// 文本范围类型
export interface TextRange {
  start: number;
  end: number;
  text: string;
}

// 版本类型
export interface Version {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  tags: string[];
}

// 编辑器命令类型
export interface EditorCommand {
  id: string;
  name: string;
  shortcut?: string;
  execute?: (state: EditorState) => void;
}

// AI 相关类型
export interface AIConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIResponse {
  text: string;
  error?: string;
}

// 主题类型
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
}

// 存储状态类型
export interface StoreState {
  content: string;
  versions: Version[];
  selectedVersion: Version | null;
  selectedTags: string[];
  theme: Theme;
  ai: AIConfig;
}

// 工具栏项类型
export interface ToolbarItem {
  id: string;
  name: string;
  icon?: string;
  shortcut?: string;
  command: EditorCommand;
}

// 搜索结果类型
export interface SearchResult {
  line: number;
  content: string;
  matches: {
    start: number;
    end: number;
    text: string;
  }[];
}
