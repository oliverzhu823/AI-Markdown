import { useEffect, useRef } from 'react';
import { useVersionStore } from '../store';

export function useAutoSave(content?: string) {
  const { settings, saveVersion } = useVersionStore();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (settings.autoSave) {
      timerRef.current = setInterval(() => {
        saveVersion(content);
      }, settings.autoSaveInterval * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [settings.autoSave, settings.autoSaveInterval, saveVersion, content]);
}
