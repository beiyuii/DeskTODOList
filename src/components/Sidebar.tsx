/**
 * 侧边栏组件
 * 提供任务分类、快速筛选和统计信息
 * 
 * @author 桌面TODO团队
 */

import React from 'react';
import { 
  List, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Clock, 
  Star, 
  Tag, 
  TrendingUp,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { TaskFilter, Priority } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useSettingsStore } from '../stores/settingsStore';
import { formatDate } from '../utils';
import clsx from 'clsx';

/**
 * 侧边栏组件Props
 */
interface SidebarProps {
  /** 样式类名 */
  className?: string;
}

/**
 * 侧边栏组件
 */
export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { tasks, filter, setFilter } = useTaskStore();
  const { settings, toggleSidebar } = useSettingsStore();
  
  const isCollapsed = settings.ui_preferences.sidebar_collapsed;

  /**
   * 计算任务统计
   */
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.is_completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => {
      if (task.is_completed || !task.due_date) return false;
      return new Date(task.due_date) < new Date();
    }).length;
    
    // 按优先级统计
    const highPriority = tasks.filter(task => !task.is_completed && task.priority === 'high').length;
    const mediumPriority = tasks.filter(task => !task.is_completed && task.priority === 'medium').length;
    const lowPriority = tasks.filter(task => !task.is_completed && task.priority === 'low').length;
    
    // 今日到期
    const today = new Date().toISOString().split('T')[0];
    const dueToday = tasks.filter(task => {
      if (task.is_completed || !task.due_date) return false;
      return task.due_date.split('T')[0] === today;
    }).length;

    return {
      total,
      completed,
      pending,
      overdue,
      highPriority,
      mediumPriority,
      lowPriority,
      dueToday
    };
  };

  /**
   * 获取热门标签
   */
  const getPopularTags = () => {
    const tagCount: Record<string, number> = {};
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  };

  const stats = getTaskStats();
  const popularTags = getPopularTags();

  /**
   * 筛选项配置
   */
  const filterItems = [
    {
      id: 'all' as TaskFilter,
      label: '全部任务',
      icon: <List className="w-4 h-4" />,
      count: stats.total,
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      id: 'active' as TaskFilter,
      label: '待办事项',
      icon: <Circle className="w-4 h-4" />,
      count: stats.pending,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'completed' as TaskFilter,
      label: '已完成',
      icon: <CheckCircle className="w-4 h-4" />,
      count: stats.completed,
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  /**
   * 快速筛选项
   */
  const quickFilters = [
    {
      label: '今日到期',
      icon: <Calendar className="w-4 h-4" />,
      count: stats.dueToday,
      color: 'text-blue-600 dark:text-blue-400',
      onClick: () => {
        // TODO: 实现今日到期筛选
      }
    },
    {
      label: '已过期',
      icon: <Clock className="w-4 h-4" />,
      count: stats.overdue,
      color: 'text-red-600 dark:text-red-400',
      onClick: () => {
        // TODO: 实现已过期筛选
      }
    },
    {
      label: '高优先级',
      icon: <Star className="w-4 h-4" />,
      count: stats.highPriority,
      color: 'text-purple-600 dark:text-purple-400',
      onClick: () => {
        // TODO: 实现高优先级筛选
      }
    }
  ];

  if (isCollapsed) {
    return (
      <div className={clsx(
        'w-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30 flex flex-col h-full',
        className
      )}>
        {/* 折叠状态的头部 */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200/30 dark:border-gray-700/30">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded-lg transition-all duration-300"
            title="展开侧边栏"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 折叠状态的筛选图标 - 可滚动区域 */}
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {filterItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={clsx(
                'w-full h-12 flex flex-col items-center justify-center rounded-lg transition-all duration-300 group relative',
                filter === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-gray-100'
              )}
              title={`${item.label} (${item.count})`}
            >
              {item.icon}
              <span className="text-xs font-medium mt-1">{item.count}</span>
            </button>
          ))}
        </div>

        {/* 统计摘要 */}
        <div className="flex-shrink-0 p-2 border-t border-gray-200/30 dark:border-gray-700/30">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {stats.completed}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              已完成
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30 flex flex-col h-full',
      className
    )}>
      {/* 侧边栏头部 */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200/30 dark:border-gray-700/30">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          任务概览
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded-lg transition-all duration-300"
          title="折叠侧边栏"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* 可滚动的主要内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 pb-6">
          {/* 主要筛选 */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              任务筛选
            </h3>
            <div className="space-y-2">
              {filterItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group',
                    filter === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={clsx(
                      'transition-colors',
                      filter === item.id ? 'text-white' : item.color
                    )}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className={clsx(
                    'text-sm font-bold px-2 py-1 rounded-lg',
                    filter === item.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 快速筛选 */}
          <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              快速筛选
            </h3>
            <div className="space-y-2">
              {quickFilters.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={item.color}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 热门标签 */}
          {popularTags.length > 0 && (
            <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                热门标签
              </h3>
              <div className="space-y-2">
                {popularTags.map(({ tag, count }) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-400"
                  >
                    <span className="text-sm font-medium truncate">{tag}</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 统计信息 */}
          <div className="mt-auto p-4 border-t border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              统计信息
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {stats.completed}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  已完成
                </div>
              </div>
              <div className="text-center p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {stats.pending}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  待完成
                </div>
              </div>
              <div className="text-center p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {stats.dueToday}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  今日到期
                </div>
              </div>
              <div className="text-center p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.overdue}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  已过期
                </div>
              </div>
            </div>
            
            {/* 完成率 */}
            {stats.total > 0 && (
              <div className="mt-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">完成率</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
