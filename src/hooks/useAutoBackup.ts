/**
 * 自动备份管理Hook
 * 提供自动备份功能的React Hook接口
 * 
 * @author 桌面TODO团队
 */

import { useEffect, useCallback, useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { autoBackupService, BackupRecord } from '../services/autoBackup';

/**
 * 自动备份Hook接口
 */
export interface UseAutoBackupReturn {
  /** 手动备份 */
  manualBackup: () => Promise<void>;
  /** 恢复备份 */
  restoreFromBackup: (backupKey: string) => Promise<void>;
  /** 获取备份历史 */
  backupHistory: BackupRecord[];
  /** 获取可用备份列表 */
  availableBackups: { key: string; timestamp: number; size: string }[];
  /** 获取最近备份 */
  lastBackup: BackupRecord | null;
  /** 获取备份统计 */
  backupStats: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    lastBackup: {
      timestamp: string;
      status: string;
      taskCount: number;
      size: number;
    } | null;
  };
  /** 是否正在备份 */
  isBackingUp: boolean;
  /** 是否启用自动备份 */
  isAutoBackupEnabled: boolean;
  /** 备份间隔（小时） */
  backupInterval: number;
  /** 刷新备份数据 */
  refreshBackupData: () => void;
}

/**
 * 自动备份Hook
 */
export const useAutoBackup = (): UseAutoBackupReturn => {
  const { settings } = useSettingsStore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([]);
  const [availableBackups, setAvailableBackups] = useState<{ key: string; timestamp: number; size: string }[]>([]);
  const [lastBackup, setLastBackup] = useState<BackupRecord | null>(null);
  const [backupStats, setBackupStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    successRate: 0,
    lastBackup: null as any
  });

  /**
   * 刷新备份数据
   */
  const refreshBackupData = useCallback(() => {
    setBackupHistory(autoBackupService.getBackupHistory());
    setAvailableBackups(autoBackupService.getAvailableBackups());
    setLastBackup(autoBackupService.getLastBackup());
    setBackupStats(autoBackupService.getBackupStats());
  }, []);

  /**
   * 手动备份
   */
  const manualBackup = useCallback(async () => {
    setIsBackingUp(true);
    try {
      await autoBackupService.manualBackup();
      refreshBackupData();
    } catch (error) {
      console.error('手动备份失败:', error);
      throw error;
    } finally {
      setIsBackingUp(false);
    }
  }, [refreshBackupData]);

  /**
   * 恢复备份
   */
  const restoreFromBackup = useCallback(async (backupKey: string) => {
    try {
      await autoBackupService.restoreFromBackup(backupKey);
      refreshBackupData();
    } catch (error) {
      console.error('恢复备份失败:', error);
      throw error;
    }
  }, [refreshBackupData]);

  /**
   * 初始化和监听设置变化
   */
  useEffect(() => {
    // 初始化备份数据
    refreshBackupData();

    // 启动自动备份服务
    autoBackupService.start();

    // 组件卸载时停止自动备份
    return () => {
      autoBackupService.stop();
    };
  }, [refreshBackupData]);

  /**
   * 监听设置变化，重启自动备份服务
   */
  useEffect(() => {
    autoBackupService.restart();
  }, [settings.auto_backup, settings.backup_interval]);

  /**
   * 定期刷新备份数据
   */
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshBackupData();
    }, 60000); // 每分钟刷新一次

    return () => clearInterval(refreshInterval);
  }, [refreshBackupData]);

  return {
    manualBackup,
    restoreFromBackup,
    backupHistory,
    availableBackups,
    lastBackup,
    backupStats,
    isBackingUp,
    isAutoBackupEnabled: settings.auto_backup,
    backupInterval: settings.backup_interval,
    refreshBackupData
  };
};

export default useAutoBackup;
