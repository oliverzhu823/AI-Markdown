import React from 'react';
import { useVersionStore } from '@/store';
import { AIToolbar } from './AIToolbar';
import { SmartSuggestions } from './SmartSuggestions';
import { EditorCore } from './EditorCore';
import { TextRange } from '@/utils/editorUtils';

interface SmartSuggestion {
  text: string;
  explanation?: string;
}

export function Editor() {
  const [selection, setSelection] = React.useState<TextRange>();
  const [suggestions, setSuggestions] = React.useState<SmartSuggestion[]>([]);
  const { content, setContent } = useVersionStore();

  const handleCommand = async (command: string) => {
    // 处理AI命令
    console.log('AI command:', command);
  };

  const handleAcceptSuggestion = (suggestion: SmartSuggestion) => {
    setContent(suggestion.text);
    setSuggestions([]);
  };

  const handleRejectSuggestion = () => {
    setSuggestions([]);
  };

  return (
    <div className="editor">
      <AIToolbar
        selection={selection}
        onCommand={handleCommand}
      />
      <EditorCore
        onSelectionChange={setSelection}
      />
      <SmartSuggestions
        suggestions={suggestions}
        onAccept={handleAcceptSuggestion}
        onReject={handleRejectSuggestion}
      />
    </div>
  );
}
