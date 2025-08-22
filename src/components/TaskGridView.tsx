/**
 * 任务网格视图组件
 * 以卡片网格形式显示任务列表
 * 
 * @author 桌面TODO团队
 */

import React from 'react';
import { Calendar, Clock, Tag, Trash2, Edit3 } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { formatDate, getPriorityColor, isTaskOverdue, truncateText } from '../utils';
import clsx from 'clsx';

/**
 * 任务网格视图组件Props
 */
interface TaskGridViewProps {
  /** 任务列表 */
  tasks: Task[];
  /** 选中的任务ID */
  selectedTaskId: string | null;
  /** 任务点击回调 */
  onTaskClick?: (taskId: string) => void;
  /** 任务编辑回调 */
  onTaskEdit?: (taskId: string) => void;
  /** 样式类名 */
  className?: string;
}

/**
 * 任务网格视图组件
 */
export const TaskGridView: React.FC<TaskGridViewProps> = ({
  tasks,
  selectedTaskId,
  onTaskClick,
  onTaskEdit,
  className
}) => {
  const { toggleComplete, deleteTask, setSelectedTask } = useTaskStore();

  /**
   * 处理完成状态切换
   */
  const handleToggleComplete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    await toggleComplete(taskId);
  };

  /**
   * 处理删除任务
   */
  const handleDelete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个任务吗？')) {
      await deleteTask(taskId);
    }
  };

  /**
   * 处理编辑任务
   */
  const handleEdit = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    onTaskEdit?.(taskId);
  };

  /**
   * 处理任务点击
   */
  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
    onTaskClick?.(taskId);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Tag className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">暂无任务</p>
        <p className="text-sm mt-1">开始添加您的第一个任务吧</p>
      </div>
    );
  }

  return (
    <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6', className)}>
      {tasks.map((task) => {
        const priorityColors = getPriorityColor(task.priority);
        const isOverdue = isTaskOverdue(task.due_date);
        const isSelected = task.id === selectedTaskId;

        return (
          <div
            key={task.id}
            className={clsx(
              'group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 cursor-pointer',
              'hover:shadow-xl hover:border-gray-300/70 dark:hover:border-gray-600/70 hover:bg-white/95 dark:hover:bg-gray-800/95 transform hover:scale-105 active:scale-95',
                          isSelected 
              ? 'border-blue-400/60 shadow-2xl ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/50 scale-105' 
              : '',
            task.is_completed && !isSelected && 'opacity-60'
            )}
            onClick={() => handleTaskClick(task.id)}
            onDoubleClick={() => onTaskEdit?.(task.id)}
          >
            {/* 任务卡片内容 */}
            <div className="p-5">
              {/* 头部：优先级指示器和操作按钮 */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={clsx(
                    'w-3 h-3 rounded-full shadow-sm',
                    priorityColors.dot
                  )}
                  title={`优先级: ${task.priority}`}
                />
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEdit(e, task.id)}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="编辑任务"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, task.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="删除任务"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 完成状态复选框 */}
              <div className="flex items-start space-x-3 mb-3">
                <button
                  onClick={(e) => handleToggleComplete(e, task.id)}
                  className={clsx(
                    'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5 transform hover:scale-110 active:scale-95',
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

                {/* 任务标题 */}
                <h3
                  className={clsx(
                    'font-semibold text-sm leading-tight',
                    task.is_completed
                      ? 'line-through text-gray-500 dark:text-gray-400'
                      : 'text-gray-900 dark:text-gray-100'
                  )}
                  title={task.title}
                >
                  {truncateText(task.title, 50)}
                </h3>
              </div>

              {/* 任务描述 */}
              {task.description && (
                <p className={clsx(
                  'text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed',
                  task.is_completed && 'line-through'
                )}>
                  {truncateText(task.description, 80)}
                </p>
              )}

              {/* 元信息 */}
              <div className="space-y-2">
                {/* 截止日期 */}
                {task.due_date && (
                  <div className={clsx(
                    'flex items-center space-x-1 text-xs',
                    isOverdue && !task.is_completed 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  )}>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(task.due_date)}</span>
                    {isOverdue && !task.is_completed && (
                      <span className="text-red-500 font-medium">（已过期）</span>
                    )}
                  </div>
                )}

                {/* 标签 */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {truncateText(tag, 10)}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 创建时间和备注 */}
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(task.created_at)}</span>
                  </div>
                  {task.notes.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span>{task.notes.length} 备注</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 选中状态指示器 */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg" />
            )}
          </div>
        );
      })}
    </div>
  );
};
