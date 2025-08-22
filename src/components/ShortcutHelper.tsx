/**
 * 快捷键帮助组件
 * 显示可用的快捷键
 * 
 * @author 桌面TODO团队
 */

import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { formatShortcut } from '../hooks/useKeyboard';
import clsx from 'clsx';

/**
 * 快捷键帮助组件
 */
export const ShortcutHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettingsStore();

  /**
   * 处理ESC键关闭
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * 处理背景点击关闭
   */
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const shortcuts = [
    { action: 'new_task', label: '新建任务' },
    { action: 'search', label: '搜索任务' },
    { action: 'toggle_complete', label: '切换完成状态' },
    { action: 'delete_task', label: '删除任务' },
    { action: 'open_settings', label: '打开设置' },
    { action: 'clear_selection', label: '清除选择' }
  ];

  return (
    <>
      {/* 快捷键按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        title="快捷键帮助 (?)"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {/* 快捷键帮助弹窗 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={handleBackgroundClick}
        >
          <div 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 w-full max-w-lg max-h-[85vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Keyboard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  快捷键帮助
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl transition-all duration-300 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 transform hover:scale-110 active:scale-95"
                title="关闭 (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 快捷键列表 */}
            <div className="p-6 space-y-3 max-h-[55vh] overflow-y-auto">
              {shortcuts.map(({ action, label }) => (
                <div
                  key={action}
                  className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-700/70 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {label}
                  </span>
                  <kbd className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-mono text-sm shadow-md border border-gray-300/50 dark:border-gray-500/50 whitespace-nowrap">
                    {formatShortcut(settings.shortcuts[action as keyof typeof settings.shortcuts])}
                  </kbd>
                </div>
              ))}
            </div>

            {/* 底部提示 */}
            <div className="p-6 border-t border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  💡 在输入框内快捷键将被禁用
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  按 ESC 或点击背景关闭此窗口
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
