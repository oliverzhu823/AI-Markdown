import { TextRange } from '@/types/editor';

interface EditorCommand {
  id: string;
  name: string;
  icon: string;
  shortcut?: {
    key: string;
    ctrlKey: boolean;
    shiftKey?: boolean;
  };
  execute: (text: string, selection: TextRange) => {
    text: string;
    selection: TextRange;
  };
}

export interface TextRange {
  start: number;
  end: number;
  text: string;
}

export interface EditorCommand {
  name: string;
  execute: () => void;
}

export function executeCommand(command: EditorCommand) {
  command.execute();
}

export function getSelectedRange(element: HTMLTextAreaElement): TextRange {
  const start = element.selectionStart;
  const end = element.selectionEnd;
  const text = element.value.substring(start, end);
  return { start, end, text };
}

export function getSelectedText(text: string, selection: TextRange): string {
  return text.substring(selection.start, selection.end);
}

export function replaceSelection(
  text: string,
  selection: TextRange,
  replacement: string
): { text: string; selection: TextRange } {
  const before = text.substring(0, selection.start);
  const after = text.substring(selection.end);
  const newText = before + replacement + after;
  
  return {
    text: newText,
    selection: {
      start: selection.start,
      end: selection.start + replacement.length,
    },
  };
}

export function wrapText(
  text: string,
  selection: TextRange,
  wrapper: string,
  multiline = false
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  
  if (!selectedText) {
    const replacement = `${wrapper}文本${wrapper}`;
    return replaceSelection(text, selection, replacement);
  }

  if (multiline) {
    const lines = selectedText.split('\n');
    const wrappedLines = lines.map(line => `${wrapper}${line}`);
    const replacement = wrappedLines.join('\n');
    return replaceSelection(text, selection, replacement);
  }

  const replacement = `${wrapper}${selectedText}${wrapper}`;
  return replaceSelection(text, selection, replacement);
}

export function insertLink(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  const replacement = selectedText
    ? `[${selectedText}](url)`
    : '[链接文字](url)';
  return replaceSelection(text, selection, replacement);
}

export function insertImage(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  const replacement = selectedText
    ? `![${selectedText}](url)`
    : '![图片描述](url)';
  return replaceSelection(text, selection, replacement);
}

export function insertTable(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const table = `| 列1 | 列2 | 列3 |
|------|------|------|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;
  
  return replaceSelection(text, selection, `\n${table}\n`);
}

export function insertCodeBlock(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  const replacement = selectedText
    ? `\`\`\`\n${selectedText}\n\`\`\``
    : '```\n代码块\n```';
  return replaceSelection(text, selection, replacement);
}

export function insertOrderedList(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  if (!selectedText) {
    return replaceSelection(text, selection, '1. 列表项\n2. 列表项\n3. 列表项');
  }
  
  const lines = selectedText.split('\n');
  const numberedLines = lines.map((line, index) => `${index + 1}. ${line}`);
  return replaceSelection(text, selection, numberedLines.join('\n'));
}

export function insertUnorderedList(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  if (!selectedText) {
    return replaceSelection(text, selection, '- 列表项\n- 列表项\n- 列表项');
  }
  
  const lines = selectedText.split('\n');
  const bulletLines = lines.map(line => `- ${line}`);
  return replaceSelection(text, selection, bulletLines.join('\n'));
}

export function insertBlockquote(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  if (!selectedText) {
    return replaceSelection(text, selection, '> 引用文本');
  }
  
  const lines = selectedText.split('\n');
  const quotedLines = lines.map(line => `> ${line}`);
  return replaceSelection(text, selection, quotedLines.join('\n'));
}

export function insertHorizontalRule(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  return replaceSelection(text, selection, '\n---\n');
}

export function insertTaskList(
  text: string,
  selection: TextRange
): { text: string; selection: TextRange } {
  const selectedText = getSelectedText(text, selection);
  if (!selectedText) {
    return replaceSelection(text, selection, '- [ ] 待办事项\n- [ ] 待办事项\n- [x] 已完成事项');
  }
  
  const lines = selectedText.split('\n');
  const taskLines = lines.map(line => `- [ ] ${line}`);
  return replaceSelection(text, selection, taskLines.join('\n'));
}

export const EditorCommands: Record<string, EditorCommand> = {
  Bold: {
    id: 'bold',
    name: '粗体',
    icon: 'format-bold',
    shortcut: { key: 'b', ctrlKey: true },
    execute: (text: string, selection: TextRange) => wrapText(text, selection, '**'),
  },
  Italic: {
    id: 'italic',
    name: '斜体',
    icon: 'format-italic',
    shortcut: { key: 'i', ctrlKey: true },
    execute: (text: string, selection: TextRange) => wrapText(text, selection, '_'),
  },
};

export type { TextRange };
