/**
 * 系统通知服务
 * 处理桌面通知的权限和发送功能
 * 
 * @author 桌面TODO团队
 */

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'warning' | 'info' | 'error';

/**
 * 通知选项
 */
export interface NotificationOptions {
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  body: string;
  /** 通知图标 */
  icon?: string;
  /** 通知类型 */
  type?: NotificationType;
  /** 自动关闭时间（毫秒），0表示不自动关闭 */
  duration?: number;
  /** 点击回调 */
  onClick?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * 通知服务类
 */
class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  /**
   * 检查是否支持通知
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * 获取当前通知权限状态
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * 请求通知权限
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.warn('请求通知权限失败:', error);
      return 'denied';
    }
  }

  /**
   * 发送桌面通知
   */
  async notify(options: NotificationOptions): Promise<Notification | null> {
    // 检查通知支持
    if (!this.isSupported) {
      console.warn('当前浏览器不支持桌面通知');
      return null;
    }

    // 检查权限
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('用户拒绝了通知权限或权限请求失败');
        return null;
      }
    }

    try {
      // 创建通知
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || this.getDefaultIcon(options.type),
        badge: options.icon || this.getDefaultIcon(options.type),
        tag: `desktodolist-${Date.now()}`, // 防止重复通知
        requireInteraction: false, // 不要求用户交互
        silent: false // 播放声音
      });

      // 设置事件监听器
      if (options.onClick) {
        notification.onclick = () => {
          options.onClick!();
          notification.close();
        };
      }

      if (options.onClose) {
        notification.onclose = options.onClose;
      }

      // 自动关闭
      const duration = options.duration ?? 5000; // 默认5秒
      if (duration > 0) {
        setTimeout(() => {
          notification.close();
        }, duration);
      }

      return notification;
    } catch (error) {
      console.error('发送通知失败:', error);
      return null;
    }
  }

  /**
   * 获取默认图标
   */
  private getDefaultIcon(type?: NotificationType): string {
    // 根据类型返回不同的图标
    const baseUrl = window.location.origin;
    switch (type) {
      case 'success':
        return `${baseUrl}/icons/success.png`;
      case 'warning':
        return `${baseUrl}/icons/warning.png`;
      case 'error':
        return `${baseUrl}/icons/error.png`;
      case 'info':
      default:
        return `${baseUrl}/icons/icon.png`; // 使用应用图标
    }
  }

  /**
   * 发送任务完成通知
   */
  async notifyTaskCompleted(taskTitle: string): Promise<void> {
    await this.notify({
      title: '任务已完成 ✅',
      body: `"${taskTitle}" 已标记为完成`,
      type: 'success',
      duration: 3000
    });
  }

  /**
   * 发送任务添加通知
   */
  async notifyTaskAdded(taskTitle: string): Promise<void> {
    await this.notify({
      title: '新任务已添加 📝',
      body: `"${taskTitle}" 已添加到任务列表`,
      type: 'info',
      duration: 3000
    });
  }

  /**
   * 发送任务删除通知
   */
  async notifyTaskDeleted(taskTitle: string): Promise<void> {
    await this.notify({
      title: '任务已删除 🗑️',
      body: `"${taskTitle}" 已从任务列表中移除`,
      type: 'warning',
      duration: 3000
    });
  }

  /**
   * 发送批量操作通知
   */
  async notifyBatchOperation(operation: string, count: number): Promise<void> {
    await this.notify({
      title: '批量操作完成 🎯',
      body: `${operation} ${count} 个任务`,
      type: 'info',
      duration: 4000
    });
  }

  /**
   * 发送错误通知
   */
  async notifyError(message: string): Promise<void> {
    await this.notify({
      title: '操作失败 ❌',
      body: message,
      type: 'error',
      duration: 5000
    });
  }

  /**
   * 发送撤销通知
   */
  async notifyUndo(operation: string): Promise<void> {
    await this.notify({
      title: '操作已撤销 ↶',
      body: `${operation} 已撤销`,
      type: 'info',
      duration: 3000
    });
  }

  /**
   * 发送数据导入/导出通知
   */
  async notifyDataOperation(operation: '导入' | '导出', count?: number): Promise<void> {
    const message = count 
      ? `成功${operation} ${count} 个任务`
      : `数据${operation}完成`;
      
    await this.notify({
      title: `数据${operation}成功 💾`,
      body: message,
      type: 'success',
      duration: 4000
    });
  }
}

// 导出单例实例
export const notificationService = new NotificationService();

// 导出类型和服务
export { NotificationService };
export default notificationService;
