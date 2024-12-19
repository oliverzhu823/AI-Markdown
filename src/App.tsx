import { useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Editor/Preview';
import { VersionPanel } from './components/VersionPanel';
import { useVersionStore } from './store';

export function App() {
  const { loadVersions } = useVersionStore();

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  return (
    <div className="app">
      <div className="editor-container">
        <Editor />
        <Preview />
      </div>
      <VersionPanel />
    </div>
  );
}
