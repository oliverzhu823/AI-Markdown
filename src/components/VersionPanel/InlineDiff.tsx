import { useMemo } from 'react';
import { diffChars, Change } from 'diff';

interface InlineDiffProps {
  oldText: string;
  newText: string;
}

export default function InlineDiff({ oldText, newText }: InlineDiffProps) {
  const changes = useMemo(() => {
    return diffChars(oldText, newText);
  }, [oldText, newText]);

  return (
    <div className="font-mono text-sm whitespace-pre-wrap break-all">
      {changes.map((change, index) => {
        if (change.added) {
          return (
            <span
              key={index}
              className="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"
            >
              {change.value}
            </span>
          );
        }
        if (change.removed) {
          return (
            <span
              key={index}
              className="bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100"
            >
              {change.value}
            </span>
          );
        }
        return <span key={index}>{change.value}</span>;
      })}
    </div>
  );
}
