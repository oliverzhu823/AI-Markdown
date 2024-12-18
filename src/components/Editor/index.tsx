import { useEffect, useRef, useCallback, useState } from 'react';
import { useVersionStore } from '@/store';
import { useAutoSave } from '@/hooks/useAutoSave';
import Toolbar from './Toolbar';
import SearchBar from './SearchBar';
import AIToolbar from './AIToolbar';
import SmartSuggestions from './SmartSuggestions';
import { EditorCommand } from '@/utils/editorUtils';

export default function Editor() {
  const { currentVersion, updateContent } = useVersionStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [showSearch, setShowSearch] = useState(false);

  useAutoSave(editorRef.current?.value);

  useEffect(() => {
    if (editorRef.current && currentVersion) {
      editorRef.current.value = currentVersion.content;
    }
  }, [currentVersion]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  }, [updateContent]);

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

    // 命令快捷键
    if (e.ctrlKey || e.metaKey) {
      const command = Object.values(EditorCommand).find(
        cmd => cmd.shortcut && cmd.shortcut.key === e.key && cmd.shortcut.ctrlKey === e.ctrlKey
      );
      if (command) {
        e.preventDefault();
        handleCommand(command);
      }
    }
  }, [handleCommand]);

  return (
    <div className="flex flex-col h-full">
      <Toolbar editorRef={editorRef} onCommand={handleCommand} />
      <AIToolbar editorRef={editorRef} />
      <div className="relative flex-1">
        {showSearch && (
          <SearchBar
            editorRef={editorRef}
            onClose={() => setShowSearch(false)}
          />
        )}
        <SmartSuggestions editorRef={editorRef} />
        <textarea
          ref={editorRef}
          className="w-full h-full p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
