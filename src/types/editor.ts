// 编辑器状态类型定义
export interface TextRange {
  start: number;
  end: number;
}

export interface EditorHistory {
  undoStack: string[];
  redoStack: string[];
}

export interface EditorState {
  content: string;
  history: EditorHistory;
  selection?: TextRange;
  settings: {
    theme: string;
    fontSize: number;
    lineHeight: number;
    tabSize: number;
  };
  tags: string[];
  undo: () => void;
  redo: () => void;
  pushToHistory: (content: string) => void;
  clearHistory: () => void;
  get: () => string;
}
