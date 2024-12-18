import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Switch } from '@headlessui/react';

export const AutoSaveSettings: React.FC = () => {
  const { autoSave, setAutoSave } = useSettingsStore();

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        自动保存设置
      </h3>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">启用自动保存</span>
        <Switch
          checked={autoSave.enabled}
          onChange={(enabled) => setAutoSave({ enabled })}
          className={`${
            autoSave.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              autoSave.enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          延迟时间 (毫秒)
        </label>
        <input
          type="number"
          value={autoSave.delay}
          onChange={(e) => setAutoSave({ delay: Number(e.target.value) })}
          min={500}
          max={10000}
          step={500}
          disabled={!autoSave.enabled}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                   dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">
          失去焦点时保存
        </span>
        <Switch
          checked={autoSave.saveOnBlur}
          onChange={(saveOnBlur) => setAutoSave({ saveOnBlur })}
          disabled={!autoSave.enabled}
          className={`${
            autoSave.saveOnBlur && autoSave.enabled
              ? 'bg-blue-600'
              : 'bg-gray-200 dark:bg-gray-600'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
             disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span
            className={`${
              autoSave.saveOnBlur ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </div>
  );
};
