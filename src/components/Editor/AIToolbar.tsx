import React, { useState, useCallback } from 'react';
import { useVersionStore } from '@/store';
import { getAICompletion, stopAICompletion, AIContext } from '@/services/ai';
import { availableModels, getModelAdapter } from '@/services/ai/models';
import { promptManager } from '@/services/ai/prompts/manager';
import { PromptTemplate } from '@/services/ai/prompts/types';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import {
  MdTranslate,
  MdOutlineTipsAndUpdates,
  MdOutlinePsychology,
  MdAutoFixHigh,
  MdSettings,
  MdClose,
  MdStopCircle,
} from 'react-icons/md';

interface AIAction {
  id: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  description: string;
  template: PromptTemplate;
  options?: Record<string, any>;
}

const aiActions: AIAction[] = [
  {
    id: 'polish',
    icon: MdAutoFixHigh,
    label: '润色',
    description: '改进文本的表达和语法',
    template: promptManager.getTemplate('polish') as PromptTemplate,
  },
  {
    id: 'translate',
    icon: MdTranslate,
    label: '翻译',
    description: '翻译文本',
    template: promptManager.getTemplate('translate') as PromptTemplate,
  },
  {
    id: 'explain',
    icon: MdOutlinePsychology,
    label: '解释',
    description: '解释文本含义',
    template: promptManager.getTemplate('explain') as PromptTemplate,
  },
  {
    id: 'improve',
    icon: MdOutlineTipsAndUpdates,
    label: '改进',
    description: '提供改进建议',
    template: promptManager.getTemplate('improve') as PromptTemplate,
  },
];

interface AIToolbarProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
}

export default function AIToolbar({ editorRef }: AIToolbarProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0]);
  const { aiConfig } = useVersionStore();
  const { toast, showToast, hideToast } = useToast();

  const handlePartialResponse = useCallback((partial: any) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = {
      start: editor.selectionStart,
      end: editor.selectionEnd,
      text: editor.value.substring(editor.selectionStart, editor.selectionEnd),
    };

    if (selection.start !== selection.end) {
      // 如果有选中的文本，替换选中的部分
      const newText = editor.value.slice(0, selection.start) +
                    partial.text +
                    editor.value.slice(selection.end);
      editor.value = newText;
      // 更新选区以包含新内容
      selection.end = selection.start + partial.text.length;
      editor.setSelectionRange(
        selection.start,
        selection.end
      );
    } else {
      // 如果没有选中的文本，在光标位置插入
      const cursorPos = editor.selectionStart;
      // 在光标位置插入新内容
      const newText = editor.value.slice(0, cursorPos) +
                    partial.text +
                    editor.value.slice(cursorPos);
      editor.value = newText;
      // 移动光标到新内容之后
      const newCursorPos = cursorPos + partial.text.length;
      editor.setSelectionRange(newCursorPos, newCursorPos);
    }
  }, [editorRef]);

  const handleAIRequest = async (action: AIAction) => {
    if (!editorRef.current) return;

    // 更新 URL 参数
    const url = new URL(window.location.href);
    url.searchParams.set('action', action.id);
    window.history.replaceState({}, '', url.toString());

    const selection = {
      start: editorRef.current.selectionStart,
      end: editorRef.current.selectionEnd,
      text: editorRef.current.value.substring(
        editorRef.current.selectionStart,
        editorRef.current.selectionEnd
      ),
    };

    const context: AIContext = {
      content: editorRef.current.value,
      selection,
    };

    setIsLoading(action.id);
    try {
      const prompt = action.template.template;
      const response = await getAICompletion({
        model: selectedModel,
        prompt,
        context,
        stream: true,
        onPartialResponse: handlePartialResponse,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 更新编辑器内容
      if (editorRef.current) {
        const newValue =
          editorRef.current.value.substring(0, selection.start) +
          response.text +
          editorRef.current.value.substring(selection.end);
        editorRef.current.value = newValue;
      }
    } catch (err) {
      console.error('AI请求失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      showToast('error', `AI请求失败: ${errorMessage}`);
    } finally {
      setIsLoading(null);
    }
  };

  const handleStop = () => {
    stopAICompletion();
    setIsLoading(null);
    showToast('info', '已停止生成');
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {aiActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAIRequest(action)}
                disabled={isLoading !== null}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                         text-gray-700 dark:text-gray-300 flex items-center gap-2"
                title={action.description}
              >
                <Icon size={20} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {isLoading && (
            <button
              onClick={handleStop}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MdStopCircle size={20} />
            </button>
          )}

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300
                     dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2
                     focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          >
            {availableModels.map((model) => {
              const adapter = getModelAdapter(model);
              if (!adapter) return null;
              return (
                <option key={model} value={model}>
                  {adapter.displayName}
                </option>
              );
            })}
          </select>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <MdSettings size={20} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">设置</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MdClose size={20} />
            </button>
          </div>
          {/* 设置内容 */}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4">
          <Toast
            type={toast.type}
            message={toast.message}
            show={toast.show}
            onClose={hideToast}
          />
        </div>
      )}
    </div>
  );
}
