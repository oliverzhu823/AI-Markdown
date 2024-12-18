import { useCallback } from 'react';
import { useVersionStore } from '@/store';
import { EditorCommand, editorCommands } from '@/utils/editorUtils';
import {
  MdFormatBold,
  MdFormatItalic,
  MdTitle,
  MdLink,
  MdImage,
  MdCode,
  MdTableChart,
  MdSave,
  MdFormatListNumbered,
  MdFormatListBulleted,
  MdFormatQuote,
  MdHorizontalRule,
  MdFormatStrikethrough,
  MdCheckBoxOutlineBlank,
  MdUndo,
  MdRedo,
} from 'react-icons/md';

interface ToolbarProps {
  onCommand: (command: EditorCommand) => void;
}

const iconMap = {
  'format-bold': MdFormatBold,
  'format-italic': MdFormatItalic,
  'format-strikethrough': MdFormatStrikethrough,
  'format-header-1': MdTitle,
  'link': MdLink,
  'image': MdImage,
  'code-tags': MdCode,
  'table': MdTableChart,
  'format-list-numbered': MdFormatListNumbered,
  'format-list-bulleted': MdFormatListBulleted,
  'format-quote-close': MdFormatQuote,
  'minus': MdHorizontalRule,
  'checkbox-marked-outline': MdCheckBoxOutlineBlank,
};

export default function Toolbar({ onCommand }: ToolbarProps) {
  const { saveVersion, undo, redo, history } = useVersionStore();

  const handleSave = useCallback(() => {
    saveVersion();
  }, [saveVersion]);

  const handleUndo = useCallback(() => {
    undo?.();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo?.();
  }, [redo]);

  const buttonGroups = [
    // 文本格式
    ['bold', 'italic', 'strikethrough'],
    // 标题和引用
    ['heading', 'blockquote'],
    // 列表
    ['ordered-list', 'unordered-list', 'task-list'],
    // 插入内容
    ['link', 'image', 'code', 'table', 'horizontal-rule'],
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          onClick={handleUndo}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                   text-gray-700 dark:text-gray-300 disabled:opacity-50"
          title="撤销 (Ctrl+Z)"
          disabled={!history?.undoStack.length}
        >
          <MdUndo className="w-5 h-5" />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                   text-gray-700 dark:text-gray-300 disabled:opacity-50"
          title="重做 (Ctrl+Y)"
          disabled={!history?.redoStack.length}
        >
          <MdRedo className="w-5 h-5" />
        </button>
      </div>

      {buttonGroups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 last:border-r-0"
        >
          {group.map((commandId) => {
            const command = editorCommands.find((cmd) => cmd.id === commandId);
            if (!command) return null;
            
            const Icon = iconMap[command.icon as keyof typeof iconMap];
            return (
              <button
                key={command.id}
                onClick={() => onCommand(command)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                         text-gray-700 dark:text-gray-300"
                title={`${command.name} (${command.shortcut})`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      ))}

      <button
        onClick={handleSave}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                 text-gray-700 dark:text-gray-300 ml-auto"
        title="保存 (Ctrl+S)"
      >
        <MdSave className="w-5 h-5" />
      </button>
    </div>
  );
}
