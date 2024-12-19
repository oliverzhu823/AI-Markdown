// 编辑器状态类型定义

export interface EditorHistory {
  undoStack: string[];
  redoStack: string[];
}

export interface EditorState {
  content: string;
  history: EditorHistory;
  pushToHistory: (content: string) => void;
  clearHistory: () => void;
  undo: () => void;
  redo: () => void;
}
