import React from 'react';
import { useVersionStore } from '@/store';
import { TagIcon } from '@heroicons/react/24/outline';

export default function TagStats() {
  const { versions } = useVersionStore();

  // 计算每个标签的使用次数
  const tagStats = React.useMemo(() => {
    const stats = new Map<string, number>();
    versions.forEach(version => {
      version.tags.forEach(tag => {
        stats.set(tag, (stats.get(tag) || 0) + 1);
      });
    });
    return Array.from(stats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // 只显示使用最多的5个标签
  }, [versions]);

  if (tagStats.length === 0) return null;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        热门标签
      </h3>
      <div className="space-y-2">
        {tagStats.map(([tag, count]) => (
          <div
            key={tag}
            className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <span className="flex items-center">
              <TagIcon className="w-4 h-4 mr-1" />
              {tag}
            </span>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
