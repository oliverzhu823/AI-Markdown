import React from 'react';
import { useState } from 'react';
import { useVersionStore } from '@/store';
import { Version } from '@/types';
import { format } from 'date-fns';
import { MdHistory, MdCompareArrows, MdCheck } from 'react-icons/md';
import DiffDialog from './DiffDialog';

interface Version {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  tags: string[];
}

interface VersionItemProps {
  version: Version;
  isSelected?: boolean;
  onSelect: () => void;
  onShowDiff: () => void;
}

export function VersionItem({ version, isSelected, onSelect, onShowDiff }: VersionItemProps) {
  const [showDiff, setShowDiff] = useState(false);
  const { currentVersion, loadVersion } = useVersionStore();

  const handleLoadVersion = () => {
    loadVersion(version.id);
  };

  const handleShowDiff = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDiff(true);
  };

  const isActive = currentVersion?.id === version.id;

  return (
    <div
      className={`version-item ${isSelected ? 'selected' : ''} group p-4 border-b border-gray-200 dark:border-gray-700 
                hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors
                ${isActive ? 'bg-blue-50 dark:bg-blue-900/50' : 'bg-white dark:bg-gray-900'}`}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-2">
        {/* 时间和操作按钮 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MdHistory className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {format(new Date(version.timestamp), 'yyyy-MM-dd HH:mm:ss')}
            </span>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isActive && (
              <button
                onClick={handleLoadVersion}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded
                         hover:bg-blue-600 transition-colors"
                title="加载此版本"
              >
                <MdCheck className="w-3 h-3" />
                <span>加载</span>
              </button>
            )}
            <button
              onClick={handleShowDiff}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded
                       hover:bg-gray-600 transition-colors"
              title="与当前版本对比"
            >
              <MdCompareArrows className="w-3 h-3" />
              <span>对比</span>
            </button>
          </div>
        </div>

        {/* 标签列表 */}
        {version.tags && version.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {version.tags.map(tag => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-xs rounded-full
                          ${isActive 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 预览内容 */}
        {version.content && (
          <div className="mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {version.content}
            </p>
          </div>
        )}
      </div>

      {showDiff && (
        <DiffDialog
          isOpen={showDiff}
          onClose={() => setShowDiff(false)}
          version={version}
        />
      )}
    </div>
  );
}
