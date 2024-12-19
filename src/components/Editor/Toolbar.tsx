import React from 'react';
import { useVersionStore } from '@/store';
import { EditorCommand } from '@/utils/editorUtils';

interface ToolbarProps {
  onCommand: (command: EditorCommand) => void;
}

export function Toolbar({ onCommand }: ToolbarProps) {
  const { history } = useVersionStore();

  const commands: EditorCommand[] = [
    { id: 'bold', name: '加粗', shortcut: 'Ctrl+B' },
    { id: 'italic', name: '斜体', shortcut: 'Ctrl+I' },
    { id: 'code', name: '代码', shortcut: 'Ctrl+`' },
    { id: 'link', name: '链接', shortcut: 'Ctrl+K' },
    { id: 'image', name: '图片', shortcut: 'Ctrl+Shift+I' },
    { id: 'list', name: '列表', shortcut: 'Ctrl+L' },
    { id: 'quote', name: '引用', shortcut: 'Ctrl+Q' },
  ];

  return (
    <div className="toolbar">
      <div className="history-buttons">
        <button
          onClick={() => history.undoStack.length > 0 && history.undo?.()}
          disabled={history.undoStack.length === 0}
        >
          撤销
        </button>
        <button
          onClick={() => history.redoStack.length > 0 && history.redo?.()}
          disabled={history.redoStack.length === 0}
        >
          重做
        </button>
      </div>

      <div className="format-buttons">
        {commands.map((command) => (
          <button
            key={command.id}
            onClick={() => onCommand(command)}
            title={`${command.name} (${command.shortcut})`}
          >
            {command.name}
          </button>
        ))}
      </div>
    </div>
  );
}
