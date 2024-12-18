import React from 'react';
import { useVersionStore } from '@/store';
import { marked } from 'marked';

const Preview: React.FC = () => {
  const { currentVersion } = useVersionStore();

  const html = currentVersion?.content ? marked(currentVersion.content) : '';

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">预览</h2>
      </div>
      <div 
        className="flex-1 overflow-auto p-4 prose dark:prose-invert max-w-none w-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default Preview;
