/**
 * Toast 通知管理Hook
 * 
 * @author 桌面TODO团队
 */

import { useState, useCallback } from 'react';
import { ToastData, ToastType } from '../components/Toast';
import { generateId } from '../utils';

/**
 * Toast Hook
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  /**
   * 添加Toast
   */
  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const toast: ToastData = {
      id: generateId(),
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, toast]);
    return toast.id;
  }, []);

  /**
   * 删除Toast
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * 清空所有Toast
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * 便捷方法
   */
  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('success', title, message, duration);
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('error', title, message, duration);
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('warning', title, message, duration);
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('info', title, message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };
};
