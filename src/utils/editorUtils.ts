interface TextRange {
  start: number;
  end: number;
}

export interface EditorCommand {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  execute: (text: string, selection: TextRange) => {
    text: string;
    selection: TextRange;
  };
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

export const editorCommands: EditorCommand[] = [
  {
    id: 'bold',
    name: '加粗',
    icon: 'format-bold',
    shortcut: 'Ctrl+B',
    execute: (text, selection) => wrapText(text, selection, '**'),
  },
  {
    id: 'italic',
    name: '斜体',
    icon: 'format-italic',
    shortcut: 'Ctrl+I',
    execute: (text, selection) => wrapText(text, selection, '_'),
  },
  {
    id: 'strikethrough',
    name: '删除线',
    icon: 'format-strikethrough',
    shortcut: 'Ctrl+Shift+S',
    execute: (text, selection) => wrapText(text, selection, '~~'),
  },
  {
    id: 'heading',
    name: '标题',
    icon: 'format-header-1',
    shortcut: 'Ctrl+H',
    execute: (text, selection) => wrapText(text, selection, '# ', true),
  },
  {
    id: 'link',
    name: '链接',
    icon: 'link',
    shortcut: 'Ctrl+K',
    execute: insertLink,
  },
  {
    id: 'image',
    name: '图片',
    icon: 'image',
    shortcut: 'Ctrl+Shift+I',
    execute: insertImage,
  },
  {
    id: 'code',
    name: '代码块',
    icon: 'code-tags',
    shortcut: 'Ctrl+Shift+K',
    execute: insertCodeBlock,
  },
  {
    id: 'table',
    name: '表格',
    icon: 'table',
    shortcut: 'Ctrl+T',
    execute: insertTable,
  },
  {
    id: 'ordered-list',
    name: '有序列表',
    icon: 'format-list-numbered',
    shortcut: 'Ctrl+Shift+O',
    execute: insertOrderedList,
  },
  {
    id: 'unordered-list',
    name: '无序列表',
    icon: 'format-list-bulleted',
    shortcut: 'Ctrl+Shift+U',
    execute: insertUnorderedList,
  },
  {
    id: 'blockquote',
    name: '引用',
    icon: 'format-quote-close',
    shortcut: 'Ctrl+Q',
    execute: insertBlockquote,
  },
  {
    id: 'horizontal-rule',
    name: '分割线',
    icon: 'minus',
    shortcut: 'Ctrl+Shift+H',
    execute: insertHorizontalRule,
  },
  {
    id: 'task-list',
    name: '任务列表',
    icon: 'checkbox-marked-outline',
    shortcut: 'Ctrl+Shift+L',
    execute: insertTaskList,
  },
];
