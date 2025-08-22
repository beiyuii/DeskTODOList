/**
 * 快速添加任务组件
 * 提供快速输入和创建任务的界面
 * 
 * @author 桌面TODO团队
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Priority } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useNotifications } from '../hooks/useNotifications';
import { getPriorityColor } from '../utils';
import clsx from 'clsx';

/**
 * 快速添加任务组件Props
 */
interface QuickAddProps {
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 样式类名 */
  className?: string;
  /** 聚焦状态变化回调 */
  onFocusChange?: (focused: boolean) => void;
}

/**
 * 快速添加任务组件
 */
export const QuickAdd: React.FC<QuickAddProps> = ({
  autoFocus = true,
  placeholder = '添加新任务...',
  className,
  onFocusChange
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTask, isLoading } = useTaskStore();
  const { notifyTaskAdded } = useNotifications();

  /**
   * 组件挂载时自动聚焦
   */
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      onFocusChange?.(false); // 重置聚焦状态
    }
  }, [autoFocus, onFocusChange]);

  /**
   * 处理点击外部关闭优先级选择器
   */
  useEffect(() => {
    if (!showPrioritySelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // 检查是否点击了选择器外部
      if (!target.closest('.priority-selector') && !target.closest('[data-priority-button]')) {
        setShowPrioritySelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrioritySelector]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    try {
      await addTask({
        title: trimmedTitle,
        priority,
        description: '',
        notes: [],
        tags: [],
        is_completed: false
      });

      // 发送系统通知
      notifyTaskAdded(trimmedTitle);

      // 清空输入框并重置状态
      setTitle('');
      setPriority('medium');
      setShowPrioritySelector(false);
      
      // 重新聚焦输入框
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('创建任务失败:', error);
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTitle('');
      setShowPrioritySelector(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  /**
   * 处理优先级选择
   */
  const handlePrioritySelect = (selectedPriority: Priority) => {
    setPriority(selectedPriority);
    setShowPrioritySelector(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  /**
   * 计算优先级选择器的最佳位置
   */
  const getPopupPosition = () => {
    if (!inputRef.current) return { top: 0, left: 0, transform: '' };
    
    const rect = inputRef.current.getBoundingClientRect();
    const popupWidth = 240; // min-w-[240px]
    const popupHeight = 200; // 预估高度
    const margin = 8;
    
    let top = rect.bottom + margin;
    let left = rect.left;
    let transform = '';
    
    // 检查右边缘
    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - margin;
    }
    
    // 检查下边缘，如果超出则向上显示
    if (top + popupHeight > window.innerHeight) {
      top = rect.top - popupHeight - margin;
      // 如果向上也不够空间，则在可视区域内显示
      if (top < margin) {
        top = margin;
      }
    }
    
    return { top, left, transform };
  };

  const priorityOptions: { value: Priority; label: string }[] = [
    { value: 'low', label: '低优先级' },
    { value: 'medium', label: '中优先级' },
    { value: 'high', label: '高优先级' }
  ];

  return (
    <div className={clsx('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white/90 dark:bg-gray-700/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-300/50 transition-all duration-300 hover:shadow-xl">
          {/* 优先级指示器 */}
          <button
            type="button"
            data-priority-button
            onClick={() => setShowPrioritySelector(!showPrioritySelector)}
            className={clsx(
              'flex-shrink-0 w-8 h-8 rounded-xl ml-3 mr-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg border-2 border-white dark:border-gray-600 flex items-center justify-center',
              getPriorityColor(priority).dot,
              showPrioritySelector && 'ring-2 ring-blue-500/50 scale-110'
            )}
            title={`当前优先级: ${priorityOptions.find(p => p.value === priority)?.label}`}
          >
            <div className={clsx(
              'w-3 h-3 rounded-full bg-white shadow-sm',
              priority === 'high' && 'animate-pulse'
            )} />
          </button>

          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 px-4 py-4 bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base font-medium"
            maxLength={200}
          />

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={!title.trim() || isLoading}
            className={clsx(
              'flex-shrink-0 p-3 mr-3 rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              title.trim() && !isLoading
                ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                : 'text-gray-400 cursor-not-allowed opacity-50'
            )}
            title="添加任务 (Enter)"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 优先级选择器 */}
        {showPrioritySelector && (
          <div className="priority-selector bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-2xl min-w-[240px] overflow-hidden animate-scale-in"
               style={{
                 ...getPopupPosition(),
                 maxHeight: '300px',
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
               }}>
            <div className="py-3">
              {/* 标题 */}
              <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">选择优先级</h4>
              </div>
              
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePrioritySelect(option.value)}
                  className={clsx(
                    'w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.02] relative',
                    priority === option.value && 'bg-blue-100 dark:bg-blue-900/40 border-r-4 border-blue-500'
                  )}
                >
                  <div 
                    className={clsx(
                      'w-5 h-5 rounded-full mr-3 border-2 border-white shadow-lg flex items-center justify-center',
                      getPriorityColor(option.value).dot
                    )} 
                  >
                    <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                  </div>
                  <div className="flex-1">
                    <span className={clsx(
                      'font-medium block',
                      priority === option.value 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-900 dark:text-gray-100'
                    )}>
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {option.value === 'high' && '紧急重要任务'}
                      {option.value === 'medium' && '正常优先级任务'}
                      {option.value === 'low' && '不紧急任务'}
                    </span>
                  </div>
                  {priority === option.value && (
                    <div className="ml-auto">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* 字符计数提示 */}
      {title.length > 180 && (
        <div className="absolute top-full right-0 mt-1">
          <span className={clsx(
            'text-xs px-2 py-1 rounded',
            title.length >= 200 
              ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
              : 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
          )}>
            {title.length}/200
          </span>
        </div>
      )}
    </div>
  );
};
