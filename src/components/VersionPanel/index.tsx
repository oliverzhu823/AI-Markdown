import React from 'react';
import { useVersionStore } from '@/store';
import { VersionItem } from './VersionItem';
import { TagFilter } from './TagFilter';
import { TagStats } from './TagStats';

export function VersionPanel() {
  const { versions, selectedVersion, selectVersion } = useVersionStore();

  return (
    <div className="version-panel">
      <div className="panel-header">
        <h2>版本历史</h2>
        <TagStats />
        <TagFilter />
      </div>
      
      <div className="version-list">
        {versions.map((version) => (
          <VersionItem
            key={version.id}
            version={version}
            isSelected={version.id === selectedVersion?.id}
            onSelect={() => selectVersion(version)}
          />
        ))}
        {versions.length === 0 && (
          <div className="empty-state">
            暂无版本历史
          </div>
        )}
      </div>
    </div>
  );
}
