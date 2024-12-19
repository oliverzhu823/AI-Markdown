import React, { useState } from 'react';
import { useVersionStore } from '@/store';
import { Version } from '@/types';
import { FaFileImport, FaFileExport } from 'react-icons/fa';

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string>('');
  const { versions, importVersions } = useVersionStore();
  const [importData, setImportData] = useState('');

  const handleExportAll = () => {
    const dataStr = JSON.stringify(versions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `markdown-versions-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedVersions = JSON.parse(content) as Version[];
        importVersions(importedVersions);
        onClose();
      } catch (error) {
        setError(error instanceof Error ? error.message : '导入失败');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImportData = () => {
    try {
      const data = JSON.parse(importData);
      importVersions(data);
      onClose();
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查数据格式是否正确');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">导入/导出版本</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            ✕
          </button>
        </div>

        {/* 导入区域 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">导入版本</h3>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <label
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500
                       text-white rounded cursor-pointer hover:bg-green-600 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FaFileImport />
              {importing ? '导入中...' : '选择文件导入'}
            </label>
            <textarea
              value={importData}
              onChange={e => setImportData(e.target.value)}
              placeholder="粘贴JSON数据..."
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleImportData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2
                       bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FaFileImport />
              导入
            </button>
            {error && (
              <div className="text-red-500 text-sm mt-1">{error}</div>
            )}
          </div>
        </div>

        {/* 导出区域 */}
        <div>
          <h3 className="text-lg font-semibold mb-2 dark:text-white">导出版本</h3>
          <div className="space-y-2">
            <button
              onClick={handleExportAll}
              disabled={versions.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2
                       bg-blue-500 text-white rounded hover:bg-blue-600
                       disabled:bg-gray-400"
            >
              <FaFileExport />
              导出所有版本
            </button>
          </div>
          {versions.length === 0 && (
            <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              暂无可导出的版本
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportDialog;
