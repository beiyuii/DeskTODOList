/**
 * 键盘快捷键管理Hook
 * 
 * @author 桌面TODO团队
 */

import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * 快捷键回调函数类型
 */
type KeyboardCallback = () => void;

/**
 * 快捷键映射
 */
interface KeyboardHandlers {
  [key: string]: KeyboardCallback;
}

/**
 * 检查快捷键是否匹配
 */
const isKeyMatch = (event: KeyboardEvent, shortcut: string): boolean => {
  const keys = shortcut.toLowerCase().split('+');
  const pressedKeys: string[] = [];

  if (event.ctrlKey || event.metaKey) {
    pressedKeys.push('cmdorctrl');
  }
  if (event.shiftKey) {
    pressedKeys.push('shift');
  }
  if (event.altKey) {
    pressedKeys.push('alt');
  }

  // 添加主键
  const mainKey = event.key.toLowerCase();
  if (mainKey !== 'control' && mainKey !== 'meta' && mainKey !== 'shift' && mainKey !== 'alt') {
    pressedKeys.push(mainKey);
  }

  // 检查是否匹配
  return keys.every(key => pressedKeys.includes(key)) && keys.length === pressedKeys.length;
};

/**
 * 快捷键Hook
 */
export const useKeyboard = (handlers: KeyboardHandlers) => {
  const { settings } = useSettingsStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 如果正在输入，忽略快捷键
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // 检查每个快捷键
    Object.entries(settings.shortcuts).forEach(([action, shortcut]) => {
      if (isKeyMatch(event, shortcut) && handlers[action]) {
        event.preventDefault();
        event.stopPropagation();
        handlers[action]();
      }
    });
  }, [handlers, settings.shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * 格式化快捷键显示文本
 */
export const formatShortcut = (shortcut: string): string => {
  return shortcut
    .replace(/CmdOrCtrl/gi, navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
    .replace(/Shift/gi, '⇧')
    .replace(/Alt/gi, navigator.platform.includes('Mac') ? '⌥' : 'Alt')
    .replace(/\+/g, ' + ')
    .split(' + ')
    .map(key => key.charAt(0).toUpperCase() + key.slice(1))
    .join(' + ');
};
