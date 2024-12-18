import React, { useState } from 'react';
import { useVersionStore } from '@/store';

export default function TagManager() {
  const [newTag, setNewTag] = useState('');
  const { selectedTags, addTag, removeTag } = useVersionStore();

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTag} className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="添加标签..."
          className="flex-1 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 
                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          添加
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                     bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-blue-600 dark:hover:text-blue-300"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
