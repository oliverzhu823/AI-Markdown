import React from 'react';
import { useVersionStore } from '@/store';
import { TextRange } from '@/utils/editorUtils';

interface AIToolbarProps {
  selection?: TextRange;
  onCommand: (command: string) => void;
}

export function AIToolbar({ selection, onCommand }: AIToolbarProps) {
  const hasSelection = selection && selection.text.length > 0;

  return (
    <div className="ai-toolbar">
      <button
        className="toolbar-button"
        disabled={!hasSelection}
        onClick={() => onCommand('improve')}
      >
        改进
      </button>
      <button
        className="toolbar-button"
        disabled={!hasSelection}
        onClick={() => onCommand('explain')}
      >
        解释
      </button>
      <button
        className="toolbar-button"
        onClick={() => onCommand('continue')}
      >
        继续
      </button>
    </div>
  );
}
