// 编辑器状态类型定义
import { TextRange } from '@/utils/editorUtils';

export interface EditorHistory {
  undoStack: string[];
  redoStack: string[];
}

export interface EditorState {
  content: string;
  selection?: TextRange;
  history: EditorHistory;
  undo: () => void;
  redo: () => void;
  pushToHistory: (content: string) => void;
  clearHistory: () => void;
  get: () => string;
}
