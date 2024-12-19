import { useState } from 'react';
import { useVersionStore } from '@/store';
import { DiffView } from './DiffView';

interface DiffDialogProps {
  onClose: () => void;
}

export function DiffDialog({ onClose }: DiffDialogProps) {
  const { versions, content } = useVersionStore();
  const [selectedVersion, setSelectedVersion] = useState(versions[0]);

  return (
    <div className="diff-dialog">
      <div className="dialog-header">
        <h2>版本对比</h2>
        <button onClick={onClose}>×</button>
      </div>

      <div className="version-select">
        <select
          value={selectedVersion?.id}
          onChange={(e) => {
            const version = versions.find(v => v.id === e.target.value);
            if (version) setSelectedVersion(version);
          }}
        >
          {versions.map(version => (
            <option key={version.id} value={version.id}>
              {version.title}
            </option>
          ))}
        </select>
      </div>

      <div className="diff-content">
        <DiffView
          oldText={selectedVersion?.content || ''}
          newText={content}
        />
      </div>
    </div>
  );
}
