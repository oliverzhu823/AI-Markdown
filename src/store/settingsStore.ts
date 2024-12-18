import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AutoSaveSettings {
  enabled: boolean;
  delay: number;
  saveOnBlur: boolean;
}

interface SettingsState {
  autoSave: AutoSaveSettings;
  setAutoSave: (settings: Partial<AutoSaveSettings>) => void;
}

const DEFAULT_SETTINGS: AutoSaveSettings = {
  enabled: true,
  delay: 2000,
  saveOnBlur: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoSave: DEFAULT_SETTINGS,
      setAutoSave: (settings) =>
        set((state) => ({
          autoSave: { ...state.autoSave, ...settings },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
