import { useState } from 'react';
import { useVersionStore } from '@/store';
import { getAICompletion } from '@/services/ai';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIDialog({ isOpen, onClose }: AIDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateContent } = useVersionStore();
  const { toast, showToast, hideToast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      showToast('warning', '请输入指令');
      return;
    }

    setIsLoading(true);
    try {
      const response = await getAICompletion({
        model: 'deepseek',
        prompt,
        stream: false,
      });
      
      if (response.error) {
        showToast('error', response.error);
        return;
      }

      if (response.text) {
        updateContent(response.text);
        showToast('success', '内容已更新');
        onClose();
      }
    } catch (error) {
      showToast('error', '处理请求时发生错误，请重试');
      console.error('AI处理失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-2/3 max-w-2xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI 助手</h2>
        </div>
        
        <div className="p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     dark:bg-gray-700 dark:text-gray-200"
            placeholder="输入你的指令..."
            disabled={isLoading}
          />
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                     dark:hover:bg-gray-700 rounded"
            disabled={isLoading}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                处理中...
              </>
            ) : (
              '提交'
            )}
          </button>
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
