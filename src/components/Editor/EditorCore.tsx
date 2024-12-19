import { useState, useRef, useCallback } from 'react';
import { useVersionStore } from '@/store';
import { useAutoSave } from '@/hooks/useAutoSave';

interface EditorCoreProps {
  onAITrigger: () => void;
}

export default function EditorCore({ onAITrigger }: EditorCoreProps) {
  const [content, setContent] = useState('');
  const { updateContent } = useVersionStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useAutoSave(content);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateContent(newContent);
  }, [updateContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
  }, [handleChange, onAITrigger]);

  return (
    <div className="flex-1 p-4">
      <textarea
        ref={editorRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full h-full p-4 bg-white dark:bg-gray-800 border border-gray-200 
                 dark:border-gray-700 rounded-lg resize-none focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
        placeholder="开始写作..."
      />
    </div>
  );
}
