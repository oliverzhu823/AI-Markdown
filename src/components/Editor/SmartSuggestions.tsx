import React, { useEffect, useState, useCallback } from 'react';
import { useVersionStore } from '@/store';
import {
  SmartEditSuggestion,
  getSmartCompletions,
  getGrammarSuggestions,
  getEnhancementSuggestions,
  shouldTriggerSuggestions,
} from '@/utils/smartEdit';
import { TextRange } from '@/utils/editorUtils';
import {
  MdLightbulbOutline,
  MdSpellcheck,
  MdAutoFixHigh,
} from 'react-icons/md';
import clsx from 'clsx';

interface SmartSuggestionsProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
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
        suggestion.range.start,
        suggestion.range.start + suggestion.text.length
      );
    } else {
      const cursorPosition = editor.selectionStart;
      const newText =
        text.substring(0, cursorPosition) +
        suggestion.text +
        text.substring(cursorPosition);
      updateContent(newText);
      editor.setSelectionRange(
        cursorPosition + suggestion.text.length,
        cursorPosition + suggestion.text.length
      );
    }

    setSuggestions([]);
  }, [editorRef, updateContent]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      if (e.key === 'Tab' || (e.ctrlKey && e.key === 'Space')) {
        e.preventDefault();
        if (selectedIndex >= 0) {
          applySuggestion(suggestions[selectedIndex]);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev >= suggestions.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    },
    [suggestions, selectedIndex, applySuggestion]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleEditorChange = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || loading) return;

    const text = editor.value;
    const cursorPosition = editor.selectionStart;
    const lastTypedChar = text[cursorPosition - 1] || '';

    if (!shouldTriggerSuggestions(text, cursorPosition, lastTypedChar)) {
      return;
    }

    setLoading(true);
    try {
      const allSuggestions: SmartEditSuggestion[] = [];

      // 获取智能补全建议
      const completions = await getSmartCompletions(text, cursorPosition);
      allSuggestions.push(...completions);

      // 获取语法检查建议
      const selection: TextRange = {
        start: Math.max(0, cursorPosition - 100),
        end: cursorPosition,
      };
      const grammar = await getGrammarSuggestions(text, selection);
      allSuggestions.push(...grammar);

      // 获取内容增强建议
      const enhancements = await getEnhancementSuggestions(text, selection);
      allSuggestions.push(...enhancements);

      // 按置信度排序
      allSuggestions.sort((a, b) => b.confidence - a.confidence);
      setSuggestions(allSuggestions.slice(0, 5));
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  }, [editorRef, loading]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const debounceTimeout = setTimeout(handleEditorChange, 500);
    return () => clearTimeout(debounceTimeout);
  }, [handleEditorChange]);

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full max-w-2xl bg-white dark:bg-gray-800 
                    rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = getSuggestionIcon(suggestion.type);
          return (
            <div
              key={index}
              className={clsx(
                'flex items-start gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                selectedIndex === index
                  ? 'bg-blue-50 dark:bg-blue-900'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
              onClick={() => applySuggestion(suggestion)}
            >
              <Icon className="w-5 h-5 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.text}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(suggestion.confidence * 100)}% 置信度
                    </span>
                    {selectedIndex === index && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        按Tab使用
                      </span>
                    )}
                  </div>
                </div>
                {suggestion.explanation && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {suggestion.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
