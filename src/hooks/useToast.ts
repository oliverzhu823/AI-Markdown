import { useState, useCallback } from 'react';
import { ToastType } from '@/components/Toast';

interface ToastState {
  show: boolean;
  type: ToastType;
  message: string;
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'info',
    message: '',
  });

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, duration);
  }, [duration]);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}
