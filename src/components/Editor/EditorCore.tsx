import React, { useRef, useEffect } from 'react';
import { useVersionStore } from '@/store';
import { TextRange } from '@/utils/editorUtils';

interface EditorCoreProps {
  onSelectionChange?: (range: TextRange | null) => void;
  onAITrigger?: () => void;
}

export function EditorCore({ onSelectionChange, onAITrigger }: EditorCoreProps) {
  const { content, setContent } = useVersionStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleSelectionChange = () => {
      if (!editor) return;

      const start = editor.selectionStart;
      const end = editor.selectionEnd;

      if (start === end) {
        onSelectionChange?.(null);
        return;
      }

      onSelectionChange?.({
        start,
        end,
        text: editor.value.substring(start, end)
      });
    };

    editor.addEventListener('select', handleSelectionChange);
    editor.addEventListener('keyup', handleSelectionChange);
    editor.addEventListener('click', handleSelectionChange);

    return () => {
      editor.removeEventListener('select', handleSelectionChange);
      editor.removeEventListener('keyup', handleSelectionChange);
      editor.removeEventListener('click', handleSelectionChange);
    };
  }, [onSelectionChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ' && e.ctrlKey && onAITrigger) {
      e.preventDefault();
      onAITrigger();
    }
  };

  return (
    <div className="flex-1 p-4">
      <textarea
        ref={editorRef}
        className="w-full h-full p-4 bg-white dark:bg-gray-800 border border-gray-200 
                 dark:border-gray-700 rounded-lg resize-none focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 dark:text-gray-200 editor-core"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="开始写作..."
      />
    </div>
  );
}
