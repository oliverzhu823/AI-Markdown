import { useEffect } from 'react';
import Editor from './components/Editor';
import Preview from './components/Editor/Preview';
import VersionPanel from './components/VersionPanel';
import { useVersionStore } from './store';

export default function App() {
  const { loadVersions } = useVersionStore();

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  return (
    <div className="h-screen flex">
      {/* 版本面板 - 20% */}
      <div className="w-1/5 border-r border-gray-200 dark:border-gray-700">
        <VersionPanel />
      </div>
      {/* 编辑器 - 40% */}
      <div className="w-2/5 border-r border-gray-200 dark:border-gray-700">
        <Editor />
      </div>
      {/* 预览 - 60% */}
      <div className="flex-1">
        <Preview />
      </div>
    </div>
  );
}
