import React from 'react';
import { diffLines } from 'diff';
import { MdAdd, MdRemove } from 'react-icons/md';

interface DiffViewProps {
  oldText: string;
  newText: string;
}

function LineNumber({ num }: { num: number }) {
  return (
    <span className="inline-block w-12 pr-4 text-right text-gray-400 select-none">
      {num}
    </span>
  );
}

export default function DiffView({ oldText, newText }: DiffViewProps) {
  const changes = React.useMemo(() => {
    return diffLines(oldText, newText);
  }, [oldText, newText]);

  let oldLineNumber = 1;
  let newLineNumber = 1;

  return (
    <div className="font-mono text-sm">
      {changes.map((change, i) => {
        const lines = change.value.split('\n').slice(0, -1);

        return lines.map((line, j) => {
          const lineElement = (
            <div
              key={`${i}-${j}`}
              className={`flex items-start hover:bg-gray-50 dark:hover:bg-gray-800 group
                ${change.added
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : change.removed
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : ''
                }`}
            >
              {/* 行号 */}
              <div className="flex-none py-1 pr-4 text-xs border-r border-gray-200 dark:border-gray-700 select-none">
                {!change.added && (
                  <LineNumber num={oldLineNumber++} />
                )}
                {!change.removed && (
                  <LineNumber num={newLineNumber++} />
                )}
              </div>

              {/* 变更指示器 */}
              <div className="flex-none w-6 py-1 text-center select-none">
                {change.added && (
                  <MdAdd className="w-4 h-4 text-green-600 dark:text-green-400" />
                )}
                {change.removed && (
                  <MdRemove className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>

              {/* 代码内容 */}
              <div className="flex-1 py-1 pl-4 whitespace-pre">
                {line || ' '}
              </div>
            </div>
          );

          return lineElement;
        });
      })}
    </div>
  );
}
