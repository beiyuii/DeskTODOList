/**
 * Toast 通知组件
 * 显示临时消息和通知
 * 
 * @author 桌面TODO团队
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

/**
 * Toast 类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast 数据接口
 */
export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/**
 * Toast 组件Props
 */
interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

/**
 * Toast 组件
 */
export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 入场动画
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // 自动关闭
    const duration = toast.duration || 3000;
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, toast.duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50/95 dark:bg-green-900/95 border-green-200/60 dark:border-green-700/60 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50/95 dark:bg-red-900/95 border-red-200/60 dark:border-red-700/60 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50/95 dark:bg-yellow-900/95 border-yellow-200/60 dark:border-yellow-700/60 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50/95 dark:bg-blue-900/95 border-blue-200/60 dark:border-blue-700/60 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div
      className={clsx(
        'flex items-start p-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform max-w-md',
        getStyles(),
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm opacity-90 mt-1">{toast.message}</p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-3 p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Toast 容器组件
 */
interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
