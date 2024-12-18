import React from 'react';
import { useVersionStore } from '@/store';

interface SmartSuggestionsProps {
  suggestions: string[];
  onAccept: (suggestion: string) => void;
  onReject: () => void;
}

export function SmartSuggestions({ 
  suggestions, 
  onAccept, 
  onReject 
}: SmartSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="smart-suggestions">
      {suggestions.map((suggestion, index) => (
        <div key={index} className="suggestion-item">
          <div className="suggestion-content">{suggestion}</div>
          <div className="suggestion-actions">
            <button
              className="accept-button"
              onClick={() => onAccept(suggestion)}
              title="接受建议"
            >
              接受
            </button>
            <button
              className="reject-button"
              onClick={onReject}
              title="拒绝建议"
            >
              拒绝
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
