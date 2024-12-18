import { useEffect, useRef, useCallback, useState } from 'react';
import { useVersionStore } from '@/store';
import { useAutoSave } from '@/hooks/useAutoSave';
import Toolbar from './Toolbar';
import SearchBar from './SearchBar';
import AIToolbar from './AIToolbar';
import SmartSuggestions from './SmartSuggestions';
import { EditorCommand, editorCommands } from '@/utils/editorUtils';

export default function Editor() {
  const { currentVersion, updateContent, saveVersion, get } = useVersionStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [showSearch, setShowSearch] = useState(false);

  useAutoSave(editorRef.current?.value);

  useEffect(() => {
    if (editorRef.current && currentVersion) {
      editorRef.current.value = currentVersion.content;
    }
  }, [currentVersion]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

  const handleCommand = useCallback((command: EditorCommand) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;

    const result = command.execute(text, { start, end });
    
    editor.value = result.text;
    updateContent(result.text);
    
    editor.focus();
    editor.setSelectionRange(result.selection.start, result.selection.end);
  }, [updateContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 搜索快捷键
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
      return;
    }

    // 保存快捷键
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveVersion();
      return;
    }

    // 撤销快捷键
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      get().undo?.();
      return;
    }

    // 重做快捷键
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      get().redo?.();
      return;
    }

    // 格式化快捷键
    const command = editorCommands.find(cmd => {
      const shortcut = cmd.shortcut.toLowerCase();
      const key = e.key.toLowerCase();
      
      if (shortcut.includes('ctrl+shift+')) {
        return e.ctrlKey && e.shiftKey && key === shortcut.split('+')[2];
      }
      
      if (shortcut.includes('ctrl+')) {
        return e.ctrlKey && !e.shiftKey && key === shortcut.split('+')[1];
      }
      
      return false;
    });

    if (command) {
      e.preventDefault();
      handleCommand(command);
    }
  }, [handleCommand, saveVersion, get]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">编辑器</h2>
      </div>
      <Toolbar onCommand={handleCommand} />
      <AIToolbar editorRef={editorRef} />
      <div className="flex-1 relative">
        {showSearch && (
          <SearchBar
            editorRef={editorRef}
            onClose={() => setShowSearch(false)}
          />
        )}
        <textarea
          ref={editorRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full absolute inset-0 resize-none p-4 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                   focus:outline-none focus:ring-0 border-none"
          placeholder="开始写作..."
          defaultValue={currentVersion?.content}
        />
        <SmartSuggestions editorRef={editorRef} />
      </div>
    </div>
  );
}
