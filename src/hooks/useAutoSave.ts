import { useEffect } from 'react';
import { useVersionStore } from '@/store';

export function useAutoSave(content: string) {
  const { autoSaveContent } = useVersionStore();

  useEffect(() => {
    if (!content) return;

    const timer = setTimeout(() => {
      autoSaveContent(content);
    }, 5000); // 5秒后自动保存

    return () => {
      clearTimeout(timer);
    };
  }, [content, autoSaveContent]);
}
