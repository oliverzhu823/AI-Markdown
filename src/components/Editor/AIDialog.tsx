import React from 'react';
import { useVersionStore } from '@/store';
import { getAICompletion } from '@/services/ai';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface AIDialogProps {
  promptId: string;
  context: {
    text: string;
    selection?: {
      start: number;
      end: number;
      text: string;
    };
  };
  onClose: () => void;
}

export function AIDialog({ promptId, context, onClose }: AIDialogProps) {
  const { updateContent } = useVersionStore();
  const { toast, showToast, hideToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const response = await getAICompletion(promptId, context);
      setResult(response);
    } catch (error) {
      showToast('error', 'AI生成失败，请重试');
      console.error('AI生成失败:', error);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!result) return;
    updateContent(result);
    showToast('success', '内容已更新');
    onClose();
  };

  if (!context) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-2/3 max-w-2xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI 助手</h2>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div>生成中...</div>
          ) : result ? (
            <div>
              <div className="result-preview">{result}</div>
              <div className="dialog-actions">
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50
                  disabled:cursor-not-allowed flex items-center gap-2"
                >
                  接受
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                  dark:hover:bg-gray-700 rounded"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50
              disabled:cursor-not-allowed flex items-center gap-2"
            >
              生成
            </button>
          )}
        </div>
      </div>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
}
