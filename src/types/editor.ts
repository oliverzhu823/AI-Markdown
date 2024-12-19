// 编辑器状态类型定义
import { TextRange } from '@/utils/editorUtils';

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
  content: string;
  history: EditorHistory;
  get: () => string;
  setContent: (content: string) => void;
  pushToHistory: (content: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}
