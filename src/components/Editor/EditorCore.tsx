import React from 'react';
import { useVersionStore } from '@/store';
import { TextRange, getSelectionRange, setSelectionRange } from '@/utils/editorUtils';

interface EditorCoreProps {
  onAITrigger: () => void;
  onSelectionChange?: (selection: TextRange | undefined) => void;
}

export default function EditorCore({ onAITrigger, onSelectionChange }: EditorCoreProps) {
  const { content, setContent, updateContent } = useVersionStore();
  const editorRef = React.useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateContent(newContent);
  };

  const handleSelect = () => {
    if (!editorRef.current) return;
    const selection = getSelectionRange(editorRef.current);
    onSelectionChange?.(selection);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 处理AI触发
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault();
      onAITrigger();
      return;
    }

    // 处理Tab键
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorRef.current!.selectionStart;
      const end = editorRef.current!.selectionEnd;
      const value = editorRef.current!.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      editorRef.current!.value = newValue;
      editorRef.current!.selectionStart = editorRef.current!.selectionEnd = start + 2;
      handleChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
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
        onSelect={handleSelect}
        placeholder="开始写作..."
      />
    </div>
  );
}
