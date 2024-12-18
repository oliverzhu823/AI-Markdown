import { useState, useCallback } from 'react';
import { useVersionStore } from '@/store';
import { getAICompletion, AIContext, stopAICompletion } from '@/services/ai';
import { promptManager, PromptTemplate } from '@/services/ai/prompts';
import { availableModels } from '@/services/ai/models';
import {
  MdAutoFixHigh,
  MdTranslate,
  MdOutlineTipsAndUpdates,
  MdOutlinePsychology,
  MdOutlineSmartButton,
  MdSettings,
  MdClose,
  MdStopCircle,
} from 'react-icons/md';
import { FiEdit3 } from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface AIAction {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  options?: {
    style?: string;
    tone?: string;
    length?: 'short' | 'medium' | 'long';
  };
}

// 将提示词模板转换为 AIAction
const aiActions: AIAction[] = promptManager.getAllTemplates()
  .filter(template => ['writing', 'editing', 'translation'].includes(template.category))
  .map(template => ({
    id: template.id,
    icon: getIconForTemplate(template),
    label: template.name,
    description: template.description,
    options: template.defaultOptions,
  }));

// 获取模板对应的图标
function getIconForTemplate(template: PromptTemplate): React.ElementType {
  switch (template.id) {
    case 'continue':
      return FiEdit3;
    case 'polish':
      return MdAutoFixHigh;
    case 'translate-cn':
    case 'translate-en':
      return MdTranslate;
    case 'explain':
      return MdOutlinePsychology;
    case 'improve':
      return MdOutlineTipsAndUpdates;
    default:
      return HiOutlineLightBulb;
  }
}

interface AIToolbarProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
}

export default function AIToolbar({ editorRef }: AIToolbarProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { aiConfig, updateContent, updateAIConfig } = useVersionStore();
  const { toast, showToast, hideToast } = useToast();

  const getContext = useCallback((): AIContext | undefined => {
    const editor = editorRef.current;
    if (!editor) {
      showToast('error', '编辑器未就绪');
      return;
    }

    const content = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    if (start !== end) {
      return {
        content,
        selection: {
          start,
          end,
          text: content.slice(start, end),
        },
      };
    }

    return { content };
  }, [editorRef, showToast]);

  const handleAction = useCallback(async (action: AIAction) => {
    // 检查API密钥
    if (!aiConfig.apiKey) {
      showToast('error', '请先配置API密钥');
      setShowSettings(true);
      return;
    }

    const context = getContext();
    if (!context) return;

    setIsLoading(action.id);
    try {
      const prompt = promptManager.generatePrompt(action.id, context, action.options);
      const response = await getAICompletion({
        prompt,
        context,
        stream: true,
        onPartialResponse: (partial) => {
          const editor = editorRef.current;
          if (!editor) return;

          if (context.selection) {
            // 如果有选中的文本，替换选中的部分
            const newText = editor.value.slice(0, context.selection.start) +
                          partial.text +
                          editor.value.slice(context.selection.end);
            editor.value = newText;
            updateContent(newText);
            // 更新选区以包含新内容
            context.selection.end = context.selection.start + partial.text.length;
            editor.setSelectionRange(
              context.selection.start,
              context.selection.end
            );
          } else {
            // 如果没有选中的文本，在光标位置插入
            const cursorPos = editor.selectionStart;
            // 在光标位置插入新内容
            const newText = editor.value.slice(0, cursorPos) +
                          partial.text +
                          editor.value.slice(cursorPos);
            editor.value = newText;
            updateContent(newText);
            // 移动光标到新内容之后
            const newCursorPos = cursorPos + partial.text.length;
            editor.setSelectionRange(newCursorPos, newCursorPos);
          }
        },
      });

      if (response.error) {
        showToast('error', response.error);
      } else if (response.text) {
        // 如果成功生成了内容，可以显示一个成功提示
        showToast('success', '生成完成');
      }
    } catch (error: any) {
      // 检查是否是 ModelResponse 类型的错误
      if (error && typeof error === 'object' && 'error' in error) {
        showToast('error', error.error);
      } else if (error instanceof Error) {
        // 如果是标准的 Error 对象，使用其 message
        showToast('error', error.message);
      } else {
        // 未知错误类型，使用通用错误消息
        showToast('error', '处理请求时发生错误，请重试');
      }
      console.error('AI处理失败:', error);
    } finally {
      setIsLoading(null);
    }
  }, [editorRef, updateContent, aiConfig.apiKey, showToast, getContext]);

  const handleStop = useCallback(() => {
    stopAICompletion();
    setIsLoading(null);
    showToast('info', '已停止生成');
  }, [showToast]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1">
          {aiActions.map((action) => {
            const Icon = action.icon;
            const isCurrentLoading = isLoading === action.id;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={isLoading !== null}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                         text-gray-700 dark:text-gray-300 disabled:opacity-50
                         relative group"
                title={action.description}
              >
                <Icon className={`w-5 h-5 ${isCurrentLoading ? 'animate-pulse' : ''}`} />
                <span className="sr-only">{action.label}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1
                              bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0
                              group-hover:opacity-100 transition-opacity">
                  {action.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* 停止按钮 */}
        {isLoading && (
          <button
            onClick={handleStop}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-red-600 dark:text-red-400"
            title="停止生成"
          >
            <MdStopCircle className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-gray-700 dark:text-gray-300 ${
                       showSettings
                         ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                         : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                     }`}
            title="AI设置"
          >
            <MdSettings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI设置面板 */}
      {showSettings && (
        <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI设置</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                       text-gray-500 dark:text-gray-400"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                模型
              </label>
              <select
                value={aiConfig.model}
                onChange={(e) => updateAIConfig({ model: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300
                         dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2
                         focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              >
                {availableModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.displayName} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API密钥
              </label>
              <input
                type="password"
                value={aiConfig.apiKey}
                onChange={(e) => updateAIConfig({ apiKey: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300
                         dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2
                         focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                placeholder="输入API密钥"
              />
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
