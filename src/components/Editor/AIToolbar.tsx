import { useState, useCallback } from 'react';
import { useVersionStore } from '@/store';
import { getAICompletion, AIContext, stopAICompletion } from '@/services/ai';
import { promptManager, PromptTemplate } from '@/services/ai/prompts';
import {
  MdAutoFixHigh,
  MdTranslate,
  MdOutlineTipsAndUpdates,
  MdOutlinePsychology,
  MdSettings,
  MdStopCircle,
} from 'react-icons/md';
import { FiEdit3 } from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
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

interface AIToolbarProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
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
      return MdTranslate;
    case 'brainstorm':
      return MdOutlineTipsAndUpdates;
    case 'analyze':
      return MdOutlinePsychology;
    default:
      return HiOutlineLightBulb;
  }
}

export default function AIToolbar({ editorRef }: AIToolbarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const { updateContent } = useVersionStore();
  const { showToast } = useToast();

  const handleAIAction = useCallback(async (action: AIAction) => {
    const editor = editorRef.current;
    if (!editor || isLoading) return;

    const text = editor.value;
    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;
    const selectedText = text.substring(selectionStart, selectionEnd);

    setIsLoading(true);
    setSelectedAction(action);

    try {
      const context: AIContext = {
        text: selectedText || text,
        selectionStart,
        selectionEnd,
        options: action.options || {},
      };

      const completion = await getAICompletion(action.id, context);
      if (completion) {
        const newText = selectedText
          ? text.substring(0, selectionStart) + completion + text.substring(selectionEnd)
          : completion;
        updateContent(newText);
        editor.focus();
      }
    } catch (error) {
      showToast({
        title: '错误',
        description: error instanceof Error ? error.message : '生成失败，请稍后重试',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setSelectedAction(null);
    }
  }, [editorRef, isLoading, updateContent, showToast]);

  const handleStopGeneration = useCallback(() => {
    stopAICompletion();
    setIsLoading(false);
    setSelectedAction(null);
  }, []);

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {aiActions.map((action) => {
        const Icon = action.icon;
        const isSelected = selectedAction?.id === action.id;
        return (
          <button
            key={action.id}
            onClick={() => handleAIAction(action)}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                isSelected
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${isLoading && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={action.description}
          >
            <Icon className="w-4 h-4" />
            <span>{action.label}</span>
            {isSelected && isLoading && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        );
      })}
      {isLoading && (
        <button
          onClick={handleStopGeneration}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
        >
          <MdStopCircle className="w-4 h-4" />
          <span>停止生成</span>
        </button>
      )}
      <div className="flex-1" />
      <button
        onClick={() => {}} // TODO: 实现设置面板
        className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
      >
        <MdSettings className="w-5 h-5" />
      </button>
    </div>
  );
}
