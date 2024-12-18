import { diffLines, Change } from 'diff';

export interface DiffResult {
  changes: Change[];
  summary: {
    additions: number;
    deletions: number;
    changes: number;
  };
}

export function computeDiff(oldText: string, newText: string): DiffResult {
  const changes = diffLines(oldText, newText);
  
  const summary = changes.reduce(
    (acc, change) => {
      if (change.added) {
        acc.additions += change.count || 0;
      } else if (change.removed) {
        acc.deletions += change.count || 0;
      } else {
        acc.changes += 0;
      }
      return acc;
    },
    { additions: 0, deletions: 0, changes: 0 }
  );

  return { changes, summary };
}

export function formatDiffSummary(summary: DiffResult['summary']): string {
  const parts = [];
  if (summary.additions > 0) {
    parts.push(`+${summary.additions} 行`);
  }
  if (summary.deletions > 0) {
    parts.push(`-${summary.deletions} 行`);
  }
  return parts.join(', ');
}

export function getChangeClass(change: Change): string {
  if (change.added) {
    return 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100';
  }
  if (change.removed) {
    return 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100';
  }
  return '';
}
