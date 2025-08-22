/**
 * 设置面板组件
 * 提供完整的应用设置界面，包括主题、快捷键、通知等配置
 * 
 * @author 桌面TODO团队
 */

import React, { useState } from 'react';
import { X, Monitor, Sun, Moon, Bell, BellOff, Download, Upload, RotateCcw, Keyboard, Settings, Palette } from 'lucide-react';
import { DataManager } from './DataManager';
import { useSettingsStore } from '../stores/settingsStore';
import { useAutoBackup } from '../hooks/useAutoBackup';
import { useI18n } from '../hooks/useI18n';
import { Theme, TaskViewMode } from '../types';
import { formatShortcut } from '../hooks/useKeyboard';
import clsx from 'clsx';

/**
 * 设置面板组件Props
 */
interface SettingsPanelProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 设置面板组件
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'shortcuts' | 'data'>('general');
  const {
    settings,
    setTheme,
    setNotificationsEnabled,
    setAutoBackup,
    setBackupInterval,
    setTaskViewMode,
    setAlwaysOnTop
  } = useSettingsStore();
  
  const { 
    manualBackup, 
    backupStats, 
    lastBackup,
    isBackingUp,
    isAutoBackupEnabled 
  } = useAutoBackup();
  
  const { t, currentLanguage, supportedLanguages, setLanguage } = useI18n();



  /**
   * 获取主题图标
   */
  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'general', label: '常规设置', icon: <Palette className="w-4 h-4" /> },
    { id: 'shortcuts', label: '快捷键', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'data', label: '数据管理', icon: <Download className="w-4 h-4" /> }
  ] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 w-full max-w-4xl max-h-[85vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              应用设置
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl transition-all duration-300 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 transform hover:scale-105 active:scale-95"
            title="关闭设置"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(85vh-80px)]">
          {/* 侧边栏 */}
          <div className="w-56 bg-gray-50/80 dark:bg-gray-900/80 border-r border-gray-200/30 dark:border-gray-700/30 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 active:scale-95',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-8">
                {/* 外观设置 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    外观设置
                  </h3>
                  
                  {/* 主题选择 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        主题模式
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setTheme(theme)}
                            className={clsx(
                              'flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95',
                              settings.theme === theme
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                            )}
                          >
                            {getThemeIcon(theme)}
                            <span className="font-medium">
                              {theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 任务视图模式 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        任务视图模式
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['list', 'grid', 'kanban'] as TaskViewMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setTaskViewMode(mode)}
                            className={clsx(
                              'p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95',
                              settings.ui_preferences.task_view_mode === mode
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                            )}
                          >
                            <div className="font-medium">
                              {mode === 'list' ? '列表视图' : mode === 'grid' ? '网格视图' : '看板视图'}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {mode === 'list' ? '紧凑排列' : mode === 'grid' ? '卡片网格' : '拖拽管理'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 窗口设置 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    窗口设置
                  </h3>
                  
                  <div className="space-y-4">
                    {/* 窗口置顶 */}
                    <div className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-700/70 rounded-2xl">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">窗口置顶</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">保持窗口在其他应用之上</div>
                      </div>
                      <button
                        onClick={() => setAlwaysOnTop(!settings.ui_preferences.always_on_top)}
                        className={clsx(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          settings.ui_preferences.always_on_top ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        )}
                      >
                        <span
                          className={clsx(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            settings.ui_preferences.always_on_top ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </section>

                {/* 通知设置 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    通知设置
                  </h3>
                  
                  <div className="space-y-4">
                    {/* 系统通知 */}
                    <div className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-700/70 rounded-2xl">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">系统通知</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">接收任务提醒和系统通知</div>
                      </div>
                      <button
                        onClick={() => setNotificationsEnabled(!settings.notifications_enabled)}
                        className={clsx(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          settings.notifications_enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        )}
                      >
                        <span
                          className={clsx(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            settings.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>

                    {/* 自动备份 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-700/70 rounded-2xl">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">自动备份</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">定期自动备份任务数据</div>
                        </div>
                        <button
                          onClick={() => setAutoBackup(!settings.auto_backup)}
                          className={clsx(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                            settings.auto_backup ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                          )}
                        >
                          <span
                            className={clsx(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              settings.auto_backup ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>

                      {/* 备份间隔 */}
                      {settings.auto_backup && (
                        <div className="pl-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              备份间隔
                            </label>
                            <select
                              value={settings.backup_interval}
                              onChange={(e) => setBackupInterval(Number(e.target.value))}
                              className="block w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={1}>每小时</option>
                              <option value={6}>每6小时</option>
                              <option value={12}>每12小时</option>
                              <option value={24}>每天</option>
                              <option value={168}>每周</option>
                            </select>
                          </div>

                          {/* 备份状态 */}
                          <div className="p-3 bg-white/70 dark:bg-gray-600/70 rounded-xl border border-gray-200/50 dark:border-gray-500/50">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">备份状态</div>
                            
                            {lastBackup ? (
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between">
                                  <span>最近备份:</span>
                                  <span>{new Date(lastBackup.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>状态:</span>
                                  <span className={lastBackup.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {lastBackup.status === 'success' ? '成功' : '失败'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>任务数:</span>
                                  <span>{lastBackup.taskCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>大小:</span>
                                  <span>{Math.round(lastBackup.size / 1024)}KB</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 dark:text-gray-400">暂无备份记录</div>
                            )}
                            
                            {/* 备份统计 */}
                            <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-500/50">
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>成功率:</span>
                                <span className={backupStats.successRate >= 80 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                                  {backupStats.successRate}% ({backupStats.successful}/{backupStats.total})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 手动备份按钮 */}
                          <button
                            onClick={() => {
                              manualBackup().then(() => {
                                alert('手动备份完成！');
                              }).catch((error) => {
                                alert('手动备份失败：' + error.message);
                              });
                            }}
                            disabled={isBackingUp}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                          >
                            {isBackingUp ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>备份中...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>立即备份</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 语言设置 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-700/70 rounded-2xl">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{t('settings.language')}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.languageDesc')}</div>
                        </div>
                        <select
                          value={currentLanguage}
                          onChange={(e) => setLanguage(e.target.value as any)}
                          className="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {supportedLanguages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.nativeName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Keyboard className="w-5 h-5 mr-2" />
                    快捷键设置
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    💡 快捷键自定义功能即将推出
                  </div>
                </div>

                <div className="grid gap-4">
                  {Object.entries(settings.shortcuts).map(([action, shortcut]) => {
                    const labels: Record<string, string> = {
                      new_task: '新建任务',
                      search: '搜索任务',
                      toggle_complete: '切换完成状态',
                      delete_task: '删除任务',
                      undo: '撤销操作',
                      export_data: '导出数据',
                      open_settings: '打开设置',
                      clear_selection: '清除选择'
                    };

                    return (
                      <div
                        key={action}
                        className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-700/70 rounded-2xl"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {labels[action] || action}
                        </div>
                        <kbd className="px-3 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-mono text-sm shadow-md border border-gray-300/50 dark:border-gray-500/50">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <DataManager />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
