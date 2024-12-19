import { useEffect, useState } from 'react';
import { useVersionStore } from '@/store';
import VersionItem from './VersionItem';
import TagFilter from './TagFilter';
import TagStats from './TagStats';
import ImportExportDialog from './ImportExportDialog';
import { MdHistory, MdExpandMore, MdExpandLess } from 'react-icons/md';

export default function VersionPanel() {
  const { versions, selectedTags, loadVersions } = useVersionStore();
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const filteredVersions = selectedTags.length > 0
    ? versions.filter(version => 
        version.tags?.some(tag => selectedTags.includes(tag))
      )
    : versions;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
      {/* 标题栏 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <MdHistory className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">版本历史</h2>
        </div>
      </div>

      {/* 标签过滤器 */}
      <div className="flex-none border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => setIsTagsExpanded(!isTagsExpanded)}
          className="w-full p-4 flex items-center justify-between text-gray-700 dark:text-gray-300
                   hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="font-medium">标签筛选</span>
          {isTagsExpanded ? (
            <MdExpandLess className="w-5 h-5" />
          ) : (
            <MdExpandMore className="w-5 h-5" />
          )}
        </button>
        {isTagsExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <TagFilter />
            <TagStats />
          </div>
        )}
      </div>

      {/* 版本列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredVersions.length > 0 ? (
          filteredVersions.map(version => (
            <VersionItem
              key={version.id}
              version={version}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <MdHistory className="w-12 h-12 mb-2" />
            <p className="text-sm">暂无版本历史</p>
          </div>
        )}
      </div>

      <ImportExportDialog isOpen={false} onClose={() => {}} />
    </div>
  );
}
