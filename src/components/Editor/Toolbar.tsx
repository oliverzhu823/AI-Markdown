import { useCallback } from 'react';
import { useVersionStore } from '@/store';
import { EditorCommand } from '@/utils/editorUtils';
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
  editorRef: React.RefObject<HTMLTextAreaElement>;
  onCommand: (command: EditorCommand) => void;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  command?: EditorCommand;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Toolbar({ editorRef, onCommand }: ToolbarProps) {
  const { saveVersion, undo, redo, history } = useVersionStore();

  const handleSave = useCallback(() => {
    saveVersion();
  }, [saveVersion]);

  const handleUndo = useCallback(() => {
    if (history && history.canUndo) {
      undo?.();
    }
  }, [history, undo]);

  const handleRedo = useCallback(() => {
    if (history && history.canRedo) {
      redo?.();
    }
  }, [history, redo]);

  const toolbarButtons: ToolbarButton[] = [
    { icon: MdFormatBold, label: '粗体', command: EditorCommand.Bold },
    { icon: MdFormatItalic, label: '斜体', command: EditorCommand.Italic },
    { icon: MdFormatStrikethrough, label: '删除线', command: EditorCommand.Strikethrough },
    { icon: MdTitle, label: '标题', command: EditorCommand.Heading },
    { icon: MdLink, label: '链接', command: EditorCommand.Link },
    { icon: MdImage, label: '图片', command: EditorCommand.Image },
    { icon: MdCode, label: '代码', command: EditorCommand.Code },
    { icon: MdTableChart, label: '表格', command: EditorCommand.Table },
    { icon: MdFormatListNumbered, label: '有序列表', command: EditorCommand.OrderedList },
    { icon: MdFormatListBulleted, label: '无序列表', command: EditorCommand.UnorderedList },
    { icon: MdFormatQuote, label: '引用', command: EditorCommand.Quote },
    { icon: MdHorizontalRule, label: '分隔线', command: EditorCommand.HorizontalRule },
    { icon: MdCheckBoxOutlineBlank, label: '任务列表', command: EditorCommand.TaskList },
    { icon: MdSave, label: '保存', onClick: handleSave },
    { icon: MdUndo, label: '撤销', onClick: handleUndo, disabled: !history?.canUndo },
    { icon: MdRedo, label: '重做', onClick: handleRedo, disabled: !history?.canRedo },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {toolbarButtons.map((button, index) => {
        const Icon = button.icon;
        return (
          <button
            key={index}
            onClick={() => button.command ? onCommand(button.command) : button.onClick?.()}
            disabled={button.disabled}
            className={`
              p-1.5 rounded-md text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            title={button.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
