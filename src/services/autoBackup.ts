/**
 * 自动备份服务
 * 处理应用数据的自动备份功能
 * 
 * @author 桌面TODO团队
 */

import { db } from './database/db';
import { useSettingsStore } from '../stores/settingsStore';
import { getCurrentISOString } from '../utils';

/**
 * 备份记录接口
 */
export interface BackupRecord {
  /** 备份ID */
  id: string;
  /** 备份时间戳 */
  timestamp: string;
  /** 备份大小（字节） */
  size: number;
  /** 任务数量 */
  taskCount: number;
  /** 备份状态 */
  status: 'success' | 'failed';
  /** 错误信息（如果失败） */
  error?: string;
}

/**
 * 自动备份服务类
 */
class AutoBackupService {
  private backupTimer: NodeJS.Timeout | null = null;
  private isBackupRunning = false;
  private backupHistory: BackupRecord[] = [];
  private readonly MAX_BACKUP_HISTORY = 50; // 最多保留50条备份记录

  constructor() {
    this.loadBackupHistory();
  }

  /**
   * 启动自动备份
   */
  start(): void {
    this.stop(); // 先停止现有的定时器
    
    const settings = useSettingsStore.getState().settings;
    
    if (!settings.auto_backup) {
      console.log('自动备份已禁用');
      return;
    }

    const intervalMs = settings.backup_interval * 60 * 60 * 1000; // 转换为毫秒
    
    console.log(`自动备份已启动，间隔: ${settings.backup_interval} 小时`);
    
    // 立即执行一次备份
    this.performBackup();
    
    // 设置定时器
    this.backupTimer = setInterval(() => {
      this.performBackup();
    }, intervalMs);
  }

  /**
   * 停止自动备份
   */
  stop(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
      console.log('自动备份已停止');
    }
  }

  /**
   * 重启自动备份（设置更改时调用）
   */
  restart(): void {
    this.start();
  }

  /**
   * 执行备份操作
   */
  private async performBackup(): Promise<void> {
    if (this.isBackupRunning) {
      console.log('备份正在进行中，跳过本次备份');
      return;
    }

    this.isBackupRunning = true;
    const backupId = `backup_${Date.now()}`;
    const timestamp = getCurrentISOString();

    try {
      console.log('开始执行自动备份...');
      
      // 导出数据
      const data = await db.exportData();
      const backupData = {
        version: '1.0.0',
        timestamp,
        ...data
      };

      // 将备份数据存储到浏览器本地存储
      const backupJson = JSON.stringify(backupData, null, 2);
      const backupKey = `desktodolist_backup_${Date.now()}`;
      
      // 使用localStorage存储备份（在实际应用中可能需要使用IndexedDB）
      try {
        localStorage.setItem(backupKey, backupJson);
      } catch (storageError) {
        // 如果localStorage空间不足，清理旧备份
        this.cleanupOldBackups();
        localStorage.setItem(backupKey, backupJson);
      }

      // 记录成功的备份
      const backupRecord: BackupRecord = {
        id: backupId,
        timestamp,
        size: new Blob([backupJson]).size,
        taskCount: data.tasks.length,
        status: 'success'
      };

      this.addBackupRecord(backupRecord);
      console.log(`自动备份完成: ${data.tasks.length} 个任务, ${Math.round(backupRecord.size / 1024)}KB`);

    } catch (error) {
      console.error('自动备份失败:', error);
      
      // 记录失败的备份
      const backupRecord: BackupRecord = {
        id: backupId,
        timestamp,
        size: 0,
        taskCount: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误'
      };

      this.addBackupRecord(backupRecord);
    } finally {
      this.isBackupRunning = false;
    }
  }

  /**
   * 清理旧备份
   */
  private cleanupOldBackups(): void {
    try {
      // 获取所有备份key
      const backupKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('desktodolist_backup_')) {
          backupKeys.push(key);
        }
      }

      // 按时间戳排序（从key中提取）
      backupKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop() || '0');
        const timestampB = parseInt(b.split('_').pop() || '0');
        return timestampA - timestampB;
      });

      // 保留最新的10个备份，删除其余的
      const keysToDelete = backupKeys.slice(0, -10);
      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`清理了 ${keysToDelete.length} 个旧备份`);
    } catch (error) {
      console.error('清理旧备份失败:', error);
    }
  }

  /**
   * 添加备份记录
   */
  private addBackupRecord(record: BackupRecord): void {
    this.backupHistory.unshift(record); // 添加到开头
    
    // 限制历史记录数量
    if (this.backupHistory.length > this.MAX_BACKUP_HISTORY) {
      this.backupHistory = this.backupHistory.slice(0, this.MAX_BACKUP_HISTORY);
    }
    
    this.saveBackupHistory();
  }

  /**
   * 获取备份历史
   */
  getBackupHistory(): BackupRecord[] {
    return [...this.backupHistory];
  }

  /**
   * 获取最近的备份
   */
  getLastBackup(): BackupRecord | null {
    return this.backupHistory.length > 0 ? this.backupHistory[0] : null;
  }

  /**
   * 手动备份
   */
  async manualBackup(): Promise<BackupRecord> {
    const backupId = `manual_backup_${Date.now()}`;
    const timestamp = getCurrentISOString();

    try {
      console.log('开始手动备份...');
      
      const data = await db.exportData();
      const backupData = {
        version: '1.0.0',
        timestamp,
        ...data
      };

      const backupJson = JSON.stringify(backupData, null, 2);
      
      // 下载备份文件
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `desktodolist-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const backupRecord: BackupRecord = {
        id: backupId,
        timestamp,
        size: blob.size,
        taskCount: data.tasks.length,
        status: 'success'
      };

      this.addBackupRecord(backupRecord);
      console.log('手动备份完成');
      
      return backupRecord;
    } catch (error) {
      console.error('手动备份失败:', error);
      
      const backupRecord: BackupRecord = {
        id: backupId,
        timestamp,
        size: 0,
        taskCount: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误'
      };

      this.addBackupRecord(backupRecord);
      throw error;
    }
  }

  /**
   * 从localStorage恢复备份
   */
  async restoreFromBackup(backupKey: string): Promise<void> {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('备份数据不存在');
      }

      const data = JSON.parse(backupData);
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('无效的备份数据格式');
      }

      // 这里应该调用数据恢复逻辑
      // 暂时只是记录日志
      console.log('从备份恢复数据:', data);
      console.log(`恢复 ${data.tasks.length} 个任务`);
      
      // TODO: 实现数据恢复逻辑
      alert(`备份恢复功能待实现。检测到 ${data.tasks.length} 个任务。`);
      
    } catch (error) {
      console.error('恢复备份失败:', error);
      throw error;
    }
  }

  /**
   * 获取可用的备份列表
   */
  getAvailableBackups(): { key: string; timestamp: number; size: string }[] {
    const backups: { key: string; timestamp: number; size: string }[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('desktodolist_backup_')) {
          const data = localStorage.getItem(key);
          if (data) {
            const timestamp = parseInt(key.split('_').pop() || '0');
            const size = Math.round(new Blob([data]).size / 1024);
            backups.push({
              key,
              timestamp,
              size: `${size}KB`
            });
          }
        }
      }
      
      // 按时间戳倒序排列
      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return [];
    }
  }

  /**
   * 保存备份历史到localStorage
   */
  private saveBackupHistory(): void {
    try {
      localStorage.setItem('desktodolist_backup_history', JSON.stringify(this.backupHistory));
    } catch (error) {
      console.warn('保存备份历史失败:', error);
    }
  }

  /**
   * 从localStorage加载备份历史
   */
  private loadBackupHistory(): void {
    try {
      const historyData = localStorage.getItem('desktodolist_backup_history');
      if (historyData) {
        this.backupHistory = JSON.parse(historyData);
      }
    } catch (error) {
      console.warn('加载备份历史失败:', error);
      this.backupHistory = [];
    }
  }

  /**
   * 获取备份统计信息
   */
  getBackupStats() {
    const history = this.backupHistory;
    const total = history.length;
    const successful = history.filter(r => r.status === 'success').length;
    const failed = history.filter(r => r.status === 'failed').length;
    const lastBackup = this.getLastBackup();
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      lastBackup: lastBackup ? {
        timestamp: lastBackup.timestamp,
        status: lastBackup.status,
        taskCount: lastBackup.taskCount,
        size: Math.round(lastBackup.size / 1024)
      } : null
    };
  }
}

// 导出单例实例
export const autoBackupService = new AutoBackupService();

// 导出类型和服务
export { AutoBackupService };
export default autoBackupService;
