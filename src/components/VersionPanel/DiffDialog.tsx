import { useEffect, useState } from 'react';
import { useVersionStore } from '@/store';
import { Version } from '@/types';
import { format } from 'date-fns';
import { MdClose, MdCompareArrows, MdSplitscreen, MdVerticalSplit } from 'react-icons/md';
import DiffView from './DiffView';
import InlineDiff from './InlineDiff';
import { computeDiff, formatDiffSummary } from '@/utils/diffUtils';

interface DiffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  version: Version;
}

type ViewMode = 'unified' | 'split';

export default function DiffDialog({ isOpen, onClose, version }: DiffDialogProps) {
  const { currentVersion } = useVersionStore();
  const [diffResult, setDiffResult] = useState<ReturnType<typeof computeDiff> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('unified');

  useEffect(() => {
    if (isOpen && currentVersion) {
      const result = computeDiff(version.content, currentVersion.content);
      setDiffResult(result);
    }
  }, [isOpen, version.content, currentVersion]);
  
  if (!isOpen || !currentVersion || !diffResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        {/* 标题栏 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MdCompareArrows className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">版本对比</h2>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {diffResult && formatDiffSummary(diffResult.summary)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 视图切换按钮 */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('unified')}
                  className={`p-2 flex items-center gap-1 text-sm transition-colors
                    ${viewMode === 'unified'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  title="统一视图"
                >
                  <MdSplitscreen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-2 flex items-center gap-1 text-sm transition-colors border-l border-gray-200 dark:border-gray-700
                    ${viewMode === 'split'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  title="分屏视图"
                >
                  <MdVerticalSplit className="w-4 h-4" />
                </button>
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                         transition-colors focus:outline-none"
              >
                <MdClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* 版本信息 */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">旧版本</div>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {format(new Date(version.timestamp), 'yyyy-MM-dd HH:mm:ss')}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">新版本</div>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {format(new Date(currentVersion.timestamp), 'yyyy-MM-dd HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>
        
        {/* 差异内容 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {viewMode === 'unified' ? (
              <div className="p-4">
                <DiffView
                  oldText={version.content}
                  newText={currentVersion.content}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 h-full">
                {/* 左侧：旧版本 */}
                <div className="overflow-auto">
                  <div className="p-4">
                    <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      旧版本
                    </div>
                    <InlineDiff
                      oldText={version.content}
                      newText={version.content}
                    />
                  </div>
                </div>

                {/* 右侧：新版本 */}
                <div className="overflow-auto">
                  <div className="p-4">
                    <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      新版本
                    </div>
                    <InlineDiff
                      oldText={version.content}
                      newText={currentVersion.content}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 
                     dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg
                     transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
