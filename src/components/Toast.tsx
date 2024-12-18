import React from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  show: boolean;
  onClose: () => void;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const styles = {
  success: 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100',
  error: 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100',
  warning: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
  info: 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
};

export const Toast: React.FC<ToastProps> = ({ type, message, show, onClose }) => {
  const Icon = icons[type];

  return (
    <Transition
      show={show}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`rounded-lg p-4 shadow-lg ${styles[type]}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">关闭</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};
