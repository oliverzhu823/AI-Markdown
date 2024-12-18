import React from 'react';

interface AIToolbarProps {
  onAction: (action: string) => void;
}

export function AIToolbar({ onAction }: AIToolbarProps) {
  return (
    <div className="ai-toolbar">
      <button
        className="toolbar-button"
        onClick={() => onAction('continue')}
        title="继续写作"
      >
        继续
      </button>
      <button
        className="toolbar-button"
        onClick={() => onAction('polish')}
        title="润色文本"
      >
        润色
      </button>
      <button
        className="toolbar-button"
        onClick={() => onAction('explain')}
        title="解释内容"
      >
        解释
      </button>
      <button
        className="toolbar-button"
        onClick={() => onAction('summarize')}
        title="总结内容"
      >
        总结
      </button>
      <button
        className="toolbar-button"
        onClick={() => onAction('outline')}
        title="生成大纲"
      >
        大纲
      </button>
    </div>
  );
}
