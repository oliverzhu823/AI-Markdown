import React, { useState } from 'react';
import { useVersionStore } from '@/store';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Tag {
  name: string;
  count: number;
}

export function TagFilter() {
  const { versions, selectedTags = [], addTag, removeTag } = useVersionStore();
  const [newTag, setNewTag] = useState('');

  // 从所有版本中收集唯一的标签
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    versions.forEach(version => {
      version.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [versions]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    removeTag(tag);
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        标签筛选
      </h3>
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                     ${
                       selectedTags.includes(tag)
                         ? 'bg-blue-500 text-white'
                         : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                     }`}
          >
            <TagIcon className="w-3 h-3 mr-1" />
            {tag}
            {selectedTags.includes(tag) && (
              <XMarkIcon className="w-3 h-3 ml-1" />
            )}
          </button>
        ))}
      </div>
      <div className="tag-filter">
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <div key={tag} className="tag">
              <span>{tag}</span>
              <button onClick={() => handleRemoveTag(tag)}>×</button>
            </div>
          ))}
        </div>

        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="添加标签过滤..."
        />
      </div>
    </div>
  );
}
