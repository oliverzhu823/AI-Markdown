import React, { useEffect, useState, useCallback } from 'react';
import { useVersionStore } from '@/store';
import {
  SmartEditSuggestion,
  getSmartCompletions,
  getGrammarSuggestions,
  getEnhancementSuggestions,
  shouldTriggerSuggestions,
} from '@/utils/smartEdit';
import {
  MdLightbulbOutline,
  MdSpellcheck,
  MdAutoFixHigh,
} from 'react-icons/md';
import clsx from 'clsx';

interface SmartSuggestionsProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
}

export interface TextRange {
  start: number;
  end: number;
  text: string;
}

export default function SmartSuggestions({ editorRef }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartEditSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { updateContent } = useVersionStore();

  const getSuggestionIcon = (type: SmartEditSuggestion['type']) => {
    switch (type) {
      case 'completion':
        return MdLightbulbOutline;
      case 'correction':
        return MdSpellcheck;
      case 'enhancement':
        return MdAutoFixHigh;
      default:
        return MdLightbulbOutline;
    }
  };

  const applySuggestion = useCallback((suggestion: SmartEditSuggestion) => {
    const editor = editorRef.current;
    if (!editor) return;

    const text = editor.value;
    if (suggestion.range) {
      const newText =
        text.substring(0, suggestion.range.start) +
        suggestion.text +
        text.substring(suggestion.range.end);
      updateContent(newText);
      editor.setSelectionRange(
        suggestion.range.start + suggestion.text.length,
        suggestion.range.start + suggestion.text.length
      );
    } else {
      const cursorPos = editor.selectionStart;
      const newText = text.substring(0, cursorPos) + suggestion.text + text.substring(cursorPos);
      updateContent(newText);
      editor.setSelectionRange(
        cursorPos + suggestion.text.length,
        cursorPos + suggestion.text.length
      );
    }
    setSuggestions([]);
  }, [editorRef, updateContent]);

  const handleSuggestions = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || loading) return;

    const text = editor.value;
    const cursorPos = editor.selectionStart;
    const currentLine = text.substring(0, cursorPos).split('\n').pop() || '';

    if (!shouldTriggerSuggestions(currentLine)) return;

    setLoading(true);
    try {
      const range: TextRange = {
        start: cursorPos - currentLine.length,
        end: cursorPos,
        text: currentLine,
      };

      const [completions, grammar, enhancements] = await Promise.all([
        getSmartCompletions(text, range),
        getGrammarSuggestions(text, range),
        getEnhancementSuggestions(text, range),
      ]);

      setSuggestions([...completions, ...grammar, ...enhancements]);
    } catch (error) {
      console.error('获取智能建议失败:', error);
    } finally {
      setLoading(false);
    }
  }, [editorRef, loading]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleInput = () => {
      handleSuggestions();
    };

    editor.addEventListener('input', handleInput);
    return () => {
      editor.removeEventListener('input', handleInput);
    };
  }, [editorRef, handleSuggestions]);

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="max-h-60 overflow-y-auto">
        {suggestions.map((suggestion, index) => {
          const Icon = getSuggestionIcon(suggestion.type);
          return (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={clsx(
                'w-full px-3 py-2 flex items-center gap-2 text-left rounded-md transition-colors',
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {suggestion.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
