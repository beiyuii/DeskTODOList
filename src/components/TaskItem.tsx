/**
 * 任务列表项组件
 * 显示单个任务的信息和操作按钮
 * 
 * @author 桌面TODO团队
 */

import React, { useState } from 'react';
import { Calendar, Edit3, Trash2, Clock, Tag } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { formatDate, getPriorityColor, isTaskOverdue, truncateText } from '../utils';
import clsx from 'clsx';

/**
 * 任务列表项组件Props
 */
interface TaskItemProps {
  /** 任务数据 */
  task: Task;
  /** 是否被选中 */
  isSelected?: boolean;
  /** 点击事件回调 */
  onClick?: (task: Task) => void;
  /** 双击事件回调 */
  onDoubleClick?: (task: Task) => void;
  /** 样式类名 */
  className?: string;
}

/**
 * 任务列表项组件
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected = false,
  onClick,
  onDoubleClick,
  className
}) => {
  const [showActions, setShowActions] = useState(false);
  const { toggleComplete, deleteTask, setSelectedTask } = useTaskStore();

  /**
   * 处理完成状态切换
   */
  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleComplete(task.id);
  };

  /**
   * 处理删除任务
   */
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个任务吗？')) {
      await deleteTask(task.id);
    }
  };

  /**
   * 处理编辑任务
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(task);
  };

  /**
   * 处理点击事件
   */
  const handleClick = () => {
    setSelectedTask(task.id);
    onClick?.(task);
  };

  /**
   * 处理双击事件
   */
  const handleDoubleClick = () => {
    onDoubleClick?.(task);
  };

  const priorityColors = getPriorityColor(task.priority);
  const isOverdue = isTaskOverdue(task.due_date);

  return (
    <div
      className={clsx(
        'group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 cursor-pointer',
        'hover:shadow-xl hover:border-gray-300/70 dark:hover:border-gray-600/70 hover:bg-white/95 dark:hover:bg-gray-800/95 transform hover:scale-[1.02]',
        isSelected 
          ? 'border-blue-400/60 shadow-2xl ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/50' 
          : '',
        task.is_completed && !isSelected && 'opacity-60',
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-5">
        <div className="flex items-start space-x-4">
          {/* 完成状态复选框 */}
          <button
            onClick={handleToggleComplete}
            className={clsx(
              'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5 transform hover:scale-110 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-md hover:shadow-lg',
              task.is_completed
                ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 bg-white dark:bg-gray-700'
            )}
            title={task.is_completed ? '标记为未完成' : '标记为已完成'}
          >
            {task.is_completed && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            {/* 标题和优先级 */}
            <div className="flex items-center space-x-3">
              <div
                className={clsx(
                  'flex-shrink-0 w-3 h-3 rounded-full shadow-sm',
                  priorityColors.dot
                )}
                title={`优先级: ${task.priority}`}
              />
              <h3
                className={clsx(
                  'text-base font-semibold truncate',
                  task.is_completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100'
                )}
                title={task.title}
              >
                {task.title}
              </h3>
            </div>

            {/* 描述 */}
            {task.description && (
              <p className={clsx(
                'mt-1 text-xs text-gray-600 dark:text-gray-400',
                task.is_completed && 'line-through'
              )}>
                {truncateText(task.description, 80)}
              </p>
            )}

            {/* 元信息 */}
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {/* 截止日期 */}
              {task.due_date && (
                <div className={clsx(
                  'flex items-center space-x-1',
                  isOverdue && !task.is_completed && 'text-red-500 dark:text-red-400'
                )}>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(task.due_date)}</span>
                  {isOverdue && !task.is_completed && (
                    <span className="text-red-500">（已过期）</span>
                  )}
                </div>
              )}

              {/* 标签 */}
              {task.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{task.tags.slice(0, 2).join(', ')}</span>
                  {task.tags.length > 2 && (
                    <span>+{task.tags.length - 2}</span>
                  )}
                </div>
              )}

              {/* 创建时间 */}
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(task.created_at)}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className={clsx(
            'flex-shrink-0 flex items-center space-x-1 transition-opacity',
            showActions ? 'opacity-100' : 'opacity-0'
          )}>
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="编辑任务"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              title="删除任务"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 备注指示器 */}
        {task.notes.length > 0 && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <span>{task.notes.length} 条备注</span>
          </div>
        )}
      </div>

      {/* 选中状态指示线 */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-2xl shadow-sm" />
      )}
    </div>
  );
};
