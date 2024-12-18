import React from 'react';
import { TextRange } from '@/types/editor';
import { SmartEditSuggestion } from '@/utils/smartEdit';

interface SmartSuggestionsProps {
  suggestions: SmartEditSuggestion[];
  onAccept: (suggestion: SmartEditSuggestion) => void;
  onReject: (suggestion: SmartEditSuggestion) => void;
}

export function SmartSuggestions({
  suggestions,
  onAccept,
  onReject,
}: SmartSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="smart-suggestions">
      {suggestions.map((suggestion, index) => (
        <div key={index} className="suggestion-item">
          <div className="suggestion-content">
            <div className="suggestion-text">{suggestion.text}</div>
            {suggestion.explanation && (
              <div className="suggestion-explanation">{suggestion.explanation}</div>
            )}
          </div>
          <div className="suggestion-actions">
            <button
              className="accept-button"
              onClick={() => onAccept(suggestion)}
              title="接受建议"
            >
              ✓
            </button>
            <button
              className="reject-button"
              onClick={() => onReject(suggestion)}
              title="拒绝建议"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
