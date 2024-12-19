import React from 'react';
import { useVersionStore } from '@/store';
import { VersionItem } from './VersionItem';
import { TagFilter } from './TagFilter';
import { TagStats } from './TagStats';

export function VersionPanel() {
  const { versions, selectedVersion, selectVersion } = useVersionStore();

  return (
    <div className="version-panel">
      <TagFilter />
      <TagStats />
      <div className="version-list">
        {versions.map((version) => (
          <VersionItem
            key={version.id}
            version={version}
            isSelected={selectedVersion?.id === version.id}
            onSelect={() => selectVersion(version)}
          />
        ))}
      </div>
    </div>
  );
}
