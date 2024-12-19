import { TextRange } from '@/types/editor';

interface EditorCommandResult {
  text: string;
  selection?: TextRange;
}

interface EditorCommand {
  id: string;
  name: string;
  shortcut: string;
}

export const createCommand = (
  id: string,
  name: string,
  shortcut: string
): EditorCommand => ({
  id,
  name,
  shortcut
});

export const getSelectionRange = (editor: any): TextRange => {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value.substring(start, end);
  return { start, end, text };
};

export const setSelectionRange = (editor: any, range: TextRange): void => {
  editor.setSelection(range.start, range.end);
};

// 基础编辑命令
export const basicCommands = {
  bold: createCommand('bold', 'Bold', 'Ctrl+B'),
  italic: createCommand('italic', 'Italic', 'Ctrl+I'),
  code: createCommand('code', 'Code', 'Ctrl+Shift+C'),
  link: createCommand('link', 'Link', 'Ctrl+Shift+L'),
  image: createCommand('image', 'Image', 'Ctrl+Shift+I'),
  list: createCommand('list', 'List', 'Ctrl+Shift+O'),
  quote: createCommand('quote', 'Quote', 'Ctrl+Shift+Q'),
};

export function executeCommand(command: EditorCommand, text: string, selection?: TextRange): EditorCommandResult {
  const result: EditorCommandResult = { text };

  if (!selection) {
    return result;
  }

  const { start, end } = selection;
  const selectedText = text.substring(start, end);

  switch (command.id) {
    case 'bold':
      result.text = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
      result.selection = { start: start + 2, end: end + 2, text: selectedText };
      break;

    case 'italic':
      result.text = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
      result.selection = { start: start + 1, end: end + 1, text: selectedText };
      break;

    case 'code':
      result.text = text.substring(0, start) + '`' + selectedText + '`' + text.substring(end);
      result.selection = { start: start + 1, end: end + 1, text: selectedText };
      break;

    case 'link':
      result.text = text.substring(0, start) + `[${selectedText}]()` + text.substring(end);
      result.selection = { start: end + 3, end: end + 3, text: '' };
      break;

    case 'image':
      result.text = text.substring(0, start) + `![${selectedText}]()` + text.substring(end);
      result.selection = { start: end + 3, end: end + 3, text: '' };
      break;

    case 'list':
      result.text = text.substring(0, start) + `- ${selectedText}` + text.substring(end);
      result.selection = { start: start + 2, end: end + 2, text: selectedText };
      break;

    case 'quote':
      result.text = text.substring(0, start) + `> ${selectedText}` + text.substring(end);
      result.selection = { start: start + 2, end: end + 2, text: selectedText };
      break;

    default:
      break;
  }

  return result;
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
      text: replacement,
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

export const EditorCommands = {
  Bold: { id: 'bold', name: '加粗', shortcut: 'Ctrl+B' },
  Italic: { id: 'italic', name: '斜体', shortcut: 'Ctrl+I' },
  Code: { id: 'code', name: '代码', shortcut: 'Ctrl+`' },
  Link: { id: 'link', name: '链接', shortcut: 'Ctrl+K' },
  Image: { id: 'image', name: '图片', shortcut: 'Ctrl+Shift+I' },
  List: { id: 'list', name: '列表', shortcut: 'Ctrl+L' },
  Quote: { id: 'quote', name: '引用', shortcut: 'Ctrl+Q' },
} as const;
