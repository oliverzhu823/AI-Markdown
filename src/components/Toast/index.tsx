import { useEffect } from 'react';
import { MdClose } from 'react-icons/md';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  type: ToastType;
  message: string;
  show: boolean;
  onClose: () => void;
}

export function Toast({ type, message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColorClass = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  return (
    <div
      className={`${bgColorClass} text-white px-4 py-2 rounded-lg shadow-lg
                  flex items-center justify-between min-w-[200px] max-w-[400px]`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-white/10 rounded-full p-1 transition-colors"
      >
        <MdClose />
      </button>
    </div>
  );
}
