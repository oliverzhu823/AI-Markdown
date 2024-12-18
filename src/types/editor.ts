// 编辑器状态类型定义
export interface TextRange {
  start: number;
  end: number;
  text: string;
}

export interface EditorHistory {
  undoStack: any[];
  redoStack: any[];
}

export interface EditorState {
  content: string;
  history: EditorHistory;
  undo: () => void;
  redo: () => void;
  pushToHistory: (content: string) => void;
  clearHistory: () => void;
  get: () => string;
}
