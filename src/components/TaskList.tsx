/**
 * 任务列表组件
 * 显示任务列表并支持筛选、搜索
 * 
 * @author 桌面TODO团队
 */

import React, { useEffect, useState } from 'react';
import { Search, Filter, Trash2, Loader2, List, Grid, Columns } from 'lucide-react';
import { TaskFilter } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useNotifications } from '../hooks/useNotifications';
import { TaskItem } from './TaskItem';
import { TaskGridView } from './TaskGridView';
import { TaskKanbanView } from './TaskKanbanView';
import { DraggableTaskList } from './DraggableTaskList';
import { DraggableTaskGridView } from './DraggableTaskGridView';
import { debounce } from '../utils';
import clsx from 'clsx';

/**
 * 任务列表组件Props
 */
interface TaskListProps {
  /** 任务点击回调 */
  onTaskClick?: (taskId: string) => void;
  /** 任务双击回调（编辑） */
  onTaskEdit?: (taskId: string) => void;
  /** 样式类名 */
  className?: string;
}

/**
 * 筛选选项配置
 */
const filterOptions: { value: TaskFilter; label: string; count?: string }[] = [
  { value: 'all', label: '全部任务' },
  { value: 'active', label: '待办事项' },
  { value: 'completed', label: '已完成' }
];

/**
 * 任务列表组件
 */
export const TaskList: React.FC<TaskListProps> = ({
  onTaskClick,
  onTaskEdit,
  className
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const {
    tasks,
    filter,
    searchQuery,
    selectedTaskId,
    isLoading,
    error,
    setFilter,
    setSearchQuery,
    clearCompleted,
    loadTasks,
    getFilteredTasks
  } = useTaskStore();
  
  const { settings, setTaskViewMode } = useSettingsStore();
  const { notifyTaskCompleted, notifyTaskDeleted, notifyBatchOperation } = useNotifications();

  /**
   * 组件挂载时加载任务
   */
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * 防抖搜索函数
   */
  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  /**
   * 处理搜索输入
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    debouncedSearch(query);
  };

  /**
   * 处理筛选器切换
   */
  const handleFilterChange = (newFilter: TaskFilter) => {
    setFilter(newFilter);
  };

  /**
   * 处理清空已完成任务
   */
  const handleClearCompleted = async () => {
    const completedCount = tasks.filter(task => task.is_completed).length;
    if (completedCount === 0) return;

    if (window.confirm(`确定要删除 ${completedCount} 个已完成的任务吗？`)) {
      await clearCompleted();
      
      // 发送系统通知
      notifyBatchOperation('清空已完成任务', completedCount);
    }
  };

  /**
   * 获取任务计数
   */
  const getTaskCounts = () => {
    const all = tasks.length;
    const active = tasks.filter(task => !task.is_completed).length;
    const completed = tasks.filter(task => task.is_completed).length;
    
    return { all, active, completed };
  };

  const filteredTasks = getFilteredTasks();
  const taskCounts = getTaskCounts();
  const currentViewMode = settings.ui_preferences.task_view_mode;

  /**
   * 获取视图模式图标
   */
  const getViewModeIcon = (mode: typeof currentViewMode) => {
    switch (mode) {
      case 'list':
        return <List className="w-4 h-4" />;
      case 'grid':
        return <Grid className="w-4 h-4" />;
      case 'kanban':
        return <Columns className="w-4 h-4" />;
    }
  };

  /**
   * 视图模式配置
   */
  const viewModes = [
    { value: 'list' as const, label: '列表视图', icon: <List className="w-4 h-4" /> },
    { value: 'grid' as const, label: '网格视图', icon: <Grid className="w-4 h-4" /> },
    { value: 'kanban' as const, label: '看板视图', icon: <Columns className="w-4 h-4" /> }
  ];

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* 搜索和筛选栏 */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200/30 dark:border-gray-700/30">
        {/* 搜索框 */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="搜索任务、描述或标签..."
            className="block w-full pl-12 pr-4 py-4 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl leading-5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300/50 transition-all duration-300 shadow-md hover:shadow-lg text-base font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setLocalSearchQuery('');
                setSearchQuery('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <span className="text-sm">清除</span>
            </button>
          )}
        </div>

        {/* 筛选按钮和视图切换 */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {filterOptions.map((option) => {
              const count = taskCounts[option.value as keyof typeof taskCounts];
              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={clsx(
                    'px-4 py-2 text-sm rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg',
                    filter === option.value
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                  )}
                >
                  {option.label}
                  <span className="ml-1 text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* 右侧：视图切换和清空按钮 */}
          <div className="flex items-center space-x-3">
            {/* 视图模式切换 */}
            <div className="flex items-center space-x-1 bg-white/80 dark:bg-gray-700/80 rounded-xl p-1 border border-gray-200/50 dark:border-gray-600/50">
              {viewModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setTaskViewMode(mode.value)}
                  className={clsx(
                    'p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    currentViewMode === mode.value
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                  )}
                  title={mode.label}
                >
                  {mode.icon}
                </button>
              ))}
            </div>

            {/* 清空已完成按钮 */}
            {taskCounts.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                title={`清空 ${taskCounts.completed} 个已完成任务`}
              >
                <Trash2 className="w-4 h-4" />
                <span>清空已完成</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 任务列表内容 */}
      <div className="flex-1 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">加载中...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <Filter className="w-8 h-8 mb-2 opacity-50" />
            {searchQuery ? (
              <>
                <p className="text-sm">未找到匹配的任务</p>
                <p className="text-xs mt-1">尝试其他关键词</p>
              </>
            ) : tasks.length === 0 ? (
              <>
                <p className="text-sm">还没有任务</p>
                <p className="text-xs mt-1">开始添加您的第一个任务吧</p>
              </>
            ) : filter === 'completed' ? (
              <>
                <p className="text-sm">还没有完成的任务</p>
                <p className="text-xs mt-1">继续加油！</p>
              </>
            ) : (
              <>
                <p className="text-sm">没有待办任务</p>
                <p className="text-xs mt-1">所有任务都已完成</p>
              </>
            )}
          </div>
        ) : (
          // 根据视图模式渲染不同的视图
          <div className="h-full overflow-hidden">
            {currentViewMode === 'list' && (
              <div className="h-full overflow-y-auto">
                <DraggableTaskList
                  tasks={filteredTasks}
                  selectedTaskId={selectedTaskId}
                  onTaskClick={onTaskClick}
                  onTaskEdit={onTaskEdit}
                />
              </div>
            )}

            {currentViewMode === 'grid' && (
              <div className="h-full overflow-y-auto">
                <DraggableTaskGridView
                  tasks={filteredTasks}
                  selectedTaskId={selectedTaskId}
                  onTaskClick={onTaskClick}
                  onTaskEdit={onTaskEdit}
                />
              </div>
            )}

            {currentViewMode === 'kanban' && (
              <div className="h-full">
                <TaskKanbanView
                  tasks={filteredTasks}
                  selectedTaskId={selectedTaskId}
                  onTaskClick={onTaskClick}
                  onTaskEdit={onTaskEdit}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部统计信息 */}
      {tasks.length > 0 && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm rounded-b-2xl">
          <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-sm">
                共 {tasks.length} 个任务
              </span>
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100/90 dark:bg-blue-900/90 text-blue-700 dark:text-blue-300 rounded-full shadow-sm">
                  显示 {filteredTasks.length} 个结果
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-sm"></div>
                <span>{taskCounts.active} 待办</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                <span>{taskCounts.completed} 已完成</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
