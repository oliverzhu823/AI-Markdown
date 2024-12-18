import React from 'react';
import { diffChars } from 'diff';

interface InlineDiffProps {
  oldText: string;
  newText: string;
}

export function InlineDiff({ oldText, newText }: InlineDiffProps) {
  const changes = diffChars(oldText, newText);

  return (
    <div className="inline-diff">
      {changes.map((change, i) => (
        <span
          key={i}
          className={`${
            change.added
              ? 'bg-green-100 text-green-900'
              : change.removed
              ? 'bg-red-100 text-red-900'
              : ''
          }`}
        >
          {change.value}
        </span>
      ))}
    </div>
  );
}
