/**
 * 系统通知管理Hook
 * 提供通知功能的React Hook接口
 * 
 * @author 桌面TODO团队
 */

import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { notificationService, NotificationOptions } from '../services/notifications';

/**
 * 通知Hook接口
 */
export interface UseNotificationsReturn {
  /** 发送通知 */
  notify: (options: NotificationOptions) => Promise<void>;
  /** 发送任务完成通知 */
  notifyTaskCompleted: (taskTitle: string) => Promise<void>;
  /** 发送任务添加通知 */
  notifyTaskAdded: (taskTitle: string) => Promise<void>;
  /** 发送任务删除通知 */
  notifyTaskDeleted: (taskTitle: string) => Promise<void>;
  /** 发送批量操作通知 */
  notifyBatchOperation: (operation: string, count: number) => Promise<void>;
  /** 发送错误通知 */
  notifyError: (message: string) => Promise<void>;
  /** 发送撤销通知 */
  notifyUndo: (operation: string) => Promise<void>;
  /** 发送数据操作通知 */
  notifyDataOperation: (operation: '导入' | '导出', count?: number) => Promise<void>;
  /** 检查通知权限 */
  checkPermission: () => Promise<NotificationPermission>;
  /** 请求通知权限 */
  requestPermission: () => Promise<NotificationPermission>;
  /** 是否支持通知 */
  isSupported: boolean;
  /** 当前通知权限 */
  permission: NotificationPermission;
  /** 通知是否启用 */
  isEnabled: boolean;
}

/**
 * 系统通知Hook
 */
export const useNotifications = (): UseNotificationsReturn => {
  const { settings } = useSettingsStore();

  // 检查通知是否启用
  const isEnabled = settings.notifications_enabled && notificationService.isNotificationSupported();

  /**
   * 通用通知发送函数
   */
  const notify = useCallback(async (options: NotificationOptions): Promise<void> => {
    if (!isEnabled) {
      return;
    }
    
    try {
      await notificationService.notify(options);
    } catch (error) {
      console.warn('发送通知失败:', error);
    }
  }, [isEnabled]);

  /**
   * 任务完成通知
   */
  const notifyTaskCompleted = useCallback(async (taskTitle: string): Promise<void> => {
    if (!isEnabled) return;
    await notificationService.notifyTaskCompleted(taskTitle);
  }, [isEnabled]);

  /**
   * 任务添加通知
   */
  const notifyTaskAdded = useCallback(async (taskTitle: string): Promise<void> => {
    if (!isEnabled) return;
    await notificationService.notifyTaskAdded(taskTitle);
  }, [isEnabled]);

  /**
   * 任务删除通知
   */
  const notifyTaskDeleted = useCallback(async (taskTitle: string): Promise<void> => {
    if (!isEnabled) return;
    await notificationService.notifyTaskDeleted(taskTitle);
  }, [isEnabled]);

  /**
   * 批量操作通知
   */
  const notifyBatchOperation = useCallback(async (operation: string, count: number): Promise<void> => {
    if (!isEnabled) return;
    await notificationService.notifyBatchOperation(operation, count);
  }, [isEnabled]);

  /**
   * 错误通知
   */
  const notifyError = useCallback(async (message: string): Promise<void> => {
    if (!isEnabled) return;
    await notificationService.notifyError(message);
  }, [isEnabled]);

  /**
   * 撤销通知
   */
  const notifyUndo = useCallback(async (operation: string): Promise<void> => {
    if (!isEnabled) return;
    await notificationService.notifyUndo(operation);
  }, [isEnabled]);

  /**
   * 数据操作通知
   */
  const notifyDataOperation = useCallback(async (operation: '导入' | '导出', count?: number): Promise<void> => {
    if (!isEnabled) return;
    await notificationService.notifyDataOperation(operation, count);
  }, [isEnabled]);

  /**
   * 检查通知权限
   */
  const checkPermission = useCallback(async (): Promise<NotificationPermission> => {
    return notificationService.getPermission();
  }, []);

  /**
   * 请求通知权限
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    return await notificationService.requestPermission();
  }, []);

  // 在组件挂载时检查通知权限
  useEffect(() => {
    if (isEnabled && notificationService.getPermission() === 'default') {
      // 如果用户启用了通知但尚未授权，可以考虑提示用户
      console.log('通知已启用，但需要用户授权');
    }
  }, [isEnabled]);

  return {
    notify,
    notifyTaskCompleted,
    notifyTaskAdded,
    notifyTaskDeleted,
    notifyBatchOperation,
    notifyError,
    notifyUndo,
    notifyDataOperation,
    checkPermission,
    requestPermission,
    isSupported: notificationService.isNotificationSupported(),
    permission: notificationService.getPermission(),
    isEnabled
  };
};

export default useNotifications;
