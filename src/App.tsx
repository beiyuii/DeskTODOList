/**
 * 桌面TODO应用主组件
 * 
 * @author 桌面TODO团队
 */

import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor, X, Minus, Square, Settings } from 'lucide-react';
import { QuickAdd } from './components/QuickAdd';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';

import { ToastContainer } from './components/Toast';
import { SettingsPanel } from './components/SettingsPanel';
import { Sidebar } from './components/Sidebar';
import { useTaskStore } from './stores/taskStore';
import { useSettingsStore, getActiveTheme } from './stores/settingsStore';
import { useKeyboard } from './hooks/useKeyboard';
import { useToast } from './hooks/useToast';
import { useNotifications } from './hooks/useNotifications';
import { useAutoBackup } from './hooks/useAutoBackup';
import { useI18n } from './hooks/useI18n';
import clsx from 'clsx';

/**
 * 主应用组件
 */
export const App: React.FC = () => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [quickAddFocused, setQuickAddFocused] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  
  const { loadTasks, error, selectedTaskId, setSelectedTask, deleteTask, toggleComplete, undo, canUndo, tasks } = useTaskStore();
  const { 
    settings, 
    showSettingsPanel, 
    toggleSettingsPanel,
    setTheme,
    setAlwaysOnTop 
  } = useSettingsStore();
  const { toasts, removeToast, success, error: showError } = useToast();
  const { 
    notifyTaskCompleted, 
    notifyTaskDeleted, 
    notifyUndo, 
    notifyError,
    requestPermission,
    isEnabled: notificationsEnabled 
  } = useNotifications();
  
  // 初始化自动备份服务
  useAutoBackup();
  
  // 国际化
  const { t } = useI18n();

  // 快捷键处理
  useKeyboard({
    new_task: () => setQuickAddFocused(true),
    search: () => {
      const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement;
      searchInput?.focus();
    },
    toggle_complete: () => {
      if (selectedTaskId) {
        const task = tasks.find(t => t.id === selectedTaskId);
        const willBeCompleted = task && !task.is_completed;
        
        toggleComplete(selectedTaskId);
        success('状态已切换', '任务状态已更新');
        
        // 发送系统通知
        if (task && willBeCompleted) {
          notifyTaskCompleted(task.title);
        }
      }
    },
    delete_task: () => {
      if (selectedTaskId) {
        const task = tasks.find(t => t.id === selectedTaskId);
        
        if (window.confirm('确定要删除这个任务吗？')) {
          deleteTask(selectedTaskId);
          success('任务已删除', '任务已从列表中移除');
          
          // 发送系统通知
          if (task) {
            notifyTaskDeleted(task.title);
          }
        }
      }
    },
    open_settings: () => toggleSettingsPanel(),
    clear_selection: () => setSelectedTask(null),
    undo: () => {
      if (canUndo) {
        undo();
        success('操作已撤销', '已恢复到之前的状态');
        
        // 发送系统通知
        notifyUndo('上一步操作');
      }
    }
  });

  /**
   * 初始化应用
   */
  useEffect(() => {
    // 加载任务数据
    loadTasks();

    // 检测操作系统
    setIsMacOS(navigator.userAgent.includes('Mac'));

    // 设置主题
    const activeTheme = getActiveTheme(settings.theme);
    document.documentElement.classList.toggle('dark', activeTheme === 'dark');

    // 同步Electron设置
    if (window.electronAPI) {
      // 同步置顶状态
      if (window.electronAPI.setAlwaysOnTop) {
        window.electronAPI.setAlwaysOnTop(settings.ui_preferences.always_on_top);
      }
      
      // 获取初始置顶状态
      if (window.electronAPI.getAlwaysOnTop) {
        window.electronAPI.getAlwaysOnTop()
          .then((isOnTop: boolean) => {
            if (isOnTop !== settings.ui_preferences.always_on_top) {
              setAlwaysOnTop(isOnTop);
            }
          })
          .catch(console.error);
      }
    }
  }, [loadTasks, settings.theme, settings.ui_preferences.always_on_top, setAlwaysOnTop]);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  /**
   * 处理通知权限
   */
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // 当用户启用通知但尚未授权时，自动请求权限
        requestPermission().then(permission => {
          if (permission === 'granted') {
            success('通知已启用', '您将收到任务相关的桌面通知');
          } else if (permission === 'denied') {
            showError('通知权限被拒绝，请在浏览器设置中手动开启');
          }
        });
      }
    }
  }, [notificationsEnabled, requestPermission, success, showError]);

  /**
   * 处理任务编辑
   */
  const handleTaskEdit = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  /**
   * 关闭任务编辑
   */
  const handleCloseTaskEdit = () => {
    setEditingTaskId(null);
  };

  /**
   * 切换主题
   */
  const handleThemeToggle = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  /**
   * 获取主题图标
   */
  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-4">
      {/* 拖拽区域和头部栏 */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 relative z-50">
        {/* 窗口控制和拖拽区域 */}
        <div 
          className="h-10 bg-transparent cursor-move flex items-center justify-between rounded-t-2xl px-4"
          style={{ WebkitAppRegion: 'drag' } as any}
        >
          {isMacOS ? (
            <>
              {/* macOS风格窗口控制按钮 */}
              <div className="flex space-x-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <div className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-500 rounded-full hover:from-red-500 hover:to-red-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95" 
                     onClick={() => window.electronAPI?.closeWindow?.()}
                     title="关闭" />
                <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
                     onClick={() => window.electronAPI?.minimizeWindow?.()}
                     title="最小化" />
                <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full hover:from-green-500 hover:to-green-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
                     onClick={() => window.electronAPI?.maximizeWindow?.()}
                     title="最大化" />
              </div>
              {/* 拖拽区域 */}
              <div className="flex-1"></div>
            </>
          ) : (
            <>
              {/* 拖拽区域 */}
              <div className="flex-1"></div>
              
              {/* Windows风格窗口控制按钮 */}
              <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as any}>
                {/* 最小化 */}
                <button
                  onClick={() => window.electronAPI?.minimizeWindow?.()}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="最小化"
                >
                  <Minus className="w-3 h-3" />
                </button>
                
                {/* 最大化/还原 */}
                <button
                  onClick={() => window.electronAPI?.maximizeWindow?.()}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="最大化"
                >
                  <Square className="w-3 h-3" />
                </button>
                
                {/* 关闭 */}
                <button
                  onClick={() => window.electronAPI?.closeWindow?.()}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-colors duration-200"
                  title="关闭"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-between p-6" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
            <span className="text-xs px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-md font-medium">
              {t('app.version')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* 设置按钮 */}
            <button
              onClick={toggleSettingsPanel}
              className={clsx(
                'p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg',
                showSettingsPanel
                  ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              )}
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* 主题切换按钮 */}
            <button
              onClick={handleThemeToggle}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              title={`当前主题: ${settings.theme}`}
            >
              {getThemeIcon()}
            </button>

          </div>
        </div>

        {/* 快速添加任务 */}
        <div className="px-6 pb-6">
          <QuickAdd 
            autoFocus={quickAddFocused}
            onFocusChange={setQuickAddFocused}
          />
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 flex overflow-hidden mt-4">
        {/* 侧边栏 */}
        <Sidebar />
        
        {/* 任务列表区域 */}
        <div className="flex-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 ml-4 overflow-hidden">
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <TaskList
            onTaskEdit={handleTaskEdit}
            className="h-full"
          />
        </div>
      </main>

      {/* 任务详情编辑弹窗 */}
      <TaskDetail
        taskId={editingTaskId}
        isOpen={!!editingTaskId}
        onClose={handleCloseTaskEdit}
      />

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={toggleSettingsPanel}
      />

      {/* Toast 通知容器 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
