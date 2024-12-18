import React from 'react';
import { diffLines } from 'diff';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface DiffViewProps {
  oldText: string;
  newText: string;
}

export function DiffView({ oldText, newText }: DiffViewProps) {
  return (
    <ReactDiffViewer
      oldValue={oldText}
      newValue={newText}
      splitView={true}
      useDarkTheme={false}
      hideLineNumbers={false}
      showDiffOnly={false}
      styles={{
        diffContainer: {
          width: '100%',
          margin: '0 auto',
        },
      }}
    />
  );
}
