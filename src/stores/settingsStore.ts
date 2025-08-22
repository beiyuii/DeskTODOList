/**
 * 应用设置状态管理Store
 * 使用Zustand进行状态管理
 * 
 * @author 桌面TODO团队
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppSettings, Theme, TaskViewMode, Shortcuts, UIPreferences } from '../types';

/**
 * 默认快捷键配置
 */
const defaultShortcuts: Shortcuts = {
  new_task: 'CmdOrCtrl+N',
  search: 'CmdOrCtrl+F',
  toggle_complete: 'Space',
  delete_task: 'Delete',
  undo: 'CmdOrCtrl+Z',
  export_data: 'CmdOrCtrl+Shift+E',
  open_settings: 'CmdOrCtrl+,',
  clear_selection: 'Escape'
};

/**
 * 默认UI偏好设置
 */
const defaultUIPreferences: UIPreferences = {
  window_size: { width: 1000, height: 700 },
  window_position: { x: -1, y: -1 },
  sidebar_collapsed: false,
  task_view_mode: 'list',
  always_on_top: false
};

/**
 * 默认应用设置
 */
const defaultSettings: AppSettings = {
  theme: 'system',
  shortcuts: defaultShortcuts,
  notifications_enabled: true,
  language: 'zh-CN',
  ui_preferences: defaultUIPreferences,
  auto_backup: true,
  backup_interval: 24
};

/**
 * 设置Store接口定义
 */
interface SettingsStore {
  // 状态
  /** 应用设置 */
  settings: AppSettings;
  /** 是否显示设置面板 */
  showSettingsPanel: boolean;

  // 操作方法
  /** 更新设置 */
  updateSettings: (updates: Partial<AppSettings>) => void;
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 设置语言 */
  setLanguage: (language: string) => void;
  /** 设置通知开关 */
  setNotificationsEnabled: (enabled: boolean) => void;
  /** 设置自动备份 */
  setAutoBackup: (enabled: boolean) => void;
  /** 设置备份间隔 */
  setBackupInterval: (hours: number) => void;
  /** 更新快捷键 */
  updateShortcuts: (shortcuts: Partial<Shortcuts>) => void;
  /** 更新UI偏好设置 */
  updateUIPreferences: (preferences: Partial<UIPreferences>) => void;
  /** 设置窗口大小 */
  setWindowSize: (width: number, height: number) => void;
  /** 设置窗口位置 */
  setWindowPosition: (x: number, y: number) => void;
  /** 设置任务视图模式 */
  setTaskViewMode: (mode: TaskViewMode) => void;
  /** 切换侧边栏 */
  toggleSidebar: () => void;
  /** 设置置顶状态 */
  setAlwaysOnTop: (enabled: boolean) => void;
  /** 显示/隐藏设置面板 */
  toggleSettingsPanel: () => void;
  /** 重置设置为默认值 */
  resetSettings: () => void;
  /** 导出设置 */
  exportSettings: () => string;
  /** 导入设置 */
  importSettings: (settingsJson: string) => boolean;
}

/**
 * 创建设置Store
 */
export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        settings: defaultSettings,
        showSettingsPanel: false,

        // 更新设置
        updateSettings: (updates) => {
          set(state => ({
            settings: { ...state.settings, ...updates }
          }), false, 'updateSettings');
        },

        // 设置主题
        setTheme: (theme) => {
          get().updateSettings({ theme });
          
          // 通知Electron主进程更新系统主题
          if (window.electronAPI?.setTheme) {
            window.electronAPI.setTheme(theme);
          }
        },

        // 设置语言
        setLanguage: (language) => {
          get().updateSettings({ language });
        },

        // 设置通知开关
        setNotificationsEnabled: (notifications_enabled) => {
          get().updateSettings({ notifications_enabled });
        },

        // 设置自动备份
        setAutoBackup: (auto_backup) => {
          get().updateSettings({ auto_backup });
        },

        // 设置备份间隔
        setBackupInterval: (backup_interval) => {
          get().updateSettings({ backup_interval });
        },

        // 更新快捷键
        updateShortcuts: (shortcutUpdates) => {
          const currentShortcuts = get().settings.shortcuts;
          const shortcuts = { ...currentShortcuts, ...shortcutUpdates };
          get().updateSettings({ shortcuts });
        },

        // 更新UI偏好设置
        updateUIPreferences: (preferenceUpdates) => {
          const currentPreferences = get().settings.ui_preferences;
          const ui_preferences = { ...currentPreferences, ...preferenceUpdates };
          get().updateSettings({ ui_preferences });
        },

        // 设置窗口大小
        setWindowSize: (width, height) => {
          get().updateUIPreferences({
            window_size: { width, height }
          });
        },

        // 设置窗口位置
        setWindowPosition: (x, y) => {
          get().updateUIPreferences({
            window_position: { x, y }
          });
        },

        // 设置任务视图模式
        setTaskViewMode: (task_view_mode) => {
          get().updateUIPreferences({ task_view_mode });
        },

        // 切换侧边栏
        toggleSidebar: () => {
          const currentCollapsed = get().settings.ui_preferences.sidebar_collapsed;
          get().updateUIPreferences({
            sidebar_collapsed: !currentCollapsed
          });
        },

        // 设置置顶状态
        setAlwaysOnTop: (always_on_top) => {
          get().updateUIPreferences({ always_on_top });
          
          // 通知Electron主进程更新置顶状态
          if (window.electronAPI?.setAlwaysOnTop) {
            window.electronAPI.setAlwaysOnTop(always_on_top);
          }
        },

        // 显示/隐藏设置面板
        toggleSettingsPanel: () => {
          set(state => ({
            showSettingsPanel: !state.showSettingsPanel
          }), false, 'toggleSettingsPanel');
        },

        // 重置设置为默认值
        resetSettings: () => {
          set({
            settings: defaultSettings
          }, false, 'resetSettings');
        },

        // 导出设置
        exportSettings: () => {
          const settings = get().settings;
          return JSON.stringify(settings, null, 2);
        },

        // 导入设置
        importSettings: (settingsJson) => {
          try {
            const importedSettings = JSON.parse(settingsJson);
            
            // 验证设置格式
            if (typeof importedSettings !== 'object' || !importedSettings) {
              throw new Error('无效的设置格式');
            }

            // 合并设置，保留当前设置的结构
            const mergedSettings = {
              ...defaultSettings,
              ...importedSettings,
              shortcuts: {
                ...defaultSettings.shortcuts,
                ...importedSettings.shortcuts
              },
              ui_preferences: {
                ...defaultSettings.ui_preferences,
                ...importedSettings.ui_preferences
              }
            };

            set({
              settings: mergedSettings
            }, false, 'importSettings');

            return true;
          } catch (error) {
            console.error('导入设置失败:', error);
            return false;
          }
        }
      }),
      {
        name: 'settings-store'
      }
    ),
    {
      name: 'settings-store'
    }
  )
);

/**
 * 获取当前系统主题
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * 获取实际应用的主题
 */
export const getActiveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};
