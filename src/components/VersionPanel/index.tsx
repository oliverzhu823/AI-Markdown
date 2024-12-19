import { useState } from 'react';
import { useVersionStore } from '@/store';
import { DiffDialog } from './DiffDialog';
import { ImportExportDialog } from './ImportExportDialog';
import { VersionItem } from './VersionItem';
import { TagFilter } from './TagFilter';
import { TagStats } from './TagStats';

export function VersionPanel() {
  const { versions, selectedTags } = useVersionStore();
  const [showDiff, setShowDiff] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  const filteredVersions = versions.filter(version =>
    selectedTags.length === 0 || version.tags.some(tag => selectedTags.includes(tag))
  );

  return (
    <div className="version-panel">
      <div className="panel-header">
        <h2>版本历史</h2>
        <div className="header-actions">
          <button onClick={() => setShowImportExport(true)}>导入/导出</button>
        </div>
      </div>

      <TagFilter />
      <TagStats versions={filteredVersions} />

      <div className="versions-list">
        {filteredVersions.map(version => (
          <VersionItem
            key={version.id}
            version={version}
            onShowDiff={() => setShowDiff(true)}
          />
        ))}
      </div>

      {showDiff && (
        <DiffDialog onClose={() => setShowDiff(false)} />
      )}

      {showImportExport && (
        <ImportExportDialog onClose={() => setShowImportExport(false)} />
      )}
    </div>
  );
}
