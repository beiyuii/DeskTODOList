/**
 * 任务看板视图组件
 * 以看板形式显示任务列表，按完成状态分组
 * 
 * @author 桌面TODO团队
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Calendar, Clock, Tag, Trash2, Edit3, Circle, CheckCircle } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { formatDate, getPriorityColor, isTaskOverdue, truncateText } from '../utils';
import clsx from 'clsx';

/**
 * 任务看板视图组件Props
 */
interface TaskKanbanViewProps {
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
 * 看板列配置
 */
interface KanbanColumn {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  filter: (task: Task) => boolean;
}

/**
 * 任务卡片组件
 */
interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onTaskClick: (taskId: string) => void;
  onTaskEdit: (taskId: string) => void;
}

/**
 * 可拖拽任务卡片组件
 */
interface DraggableTaskCardProps {
  task: Task;
  index: number;
  isSelected: boolean;
  onTaskClick: (taskId: string) => void;
  onTaskEdit: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  onTaskClick,
  onTaskEdit
}) => {
  const { toggleComplete, deleteTask, setSelectedTask } = useTaskStore();
  const priorityColors = getPriorityColor(task.priority);
  const isOverdue = isTaskOverdue(task.due_date);

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
    onTaskEdit(task.id);
  };

  /**
   * 处理任务点击
   */
  const handleTaskClick = (e: React.MouseEvent) => {
    // 防止拖拽时触发点击事件
    if (e.defaultPrevented) return;
    setSelectedTask(task.id);
    onTaskClick(task.id);
  };

  return (
    <div
      className={clsx(
        'group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 cursor-grab active:cursor-grabbing',
        'hover:shadow-lg hover:border-gray-300/70 dark:hover:border-gray-600/70 hover:bg-white/95 dark:hover:bg-gray-800/95',
        isSelected 
          ? 'border-blue-400/60 shadow-xl ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/50' 
          : '',
        task.is_completed && !isSelected && 'opacity-60'
      )}
      onClick={handleTaskClick}
      onDoubleClick={(e) => {
        e.preventDefault();
        onTaskEdit(task.id);
      }}
    >
      {/* 头部：优先级和操作按钮 */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={clsx('w-3 h-3 rounded-full shadow-sm', priorityColors.dot)}
          title={`优先级: ${task.priority}`}
        />
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
            title="编辑任务"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
            title="删除任务"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 完成状态和标题 */}
      <div className="flex items-start space-x-3 mb-3">
        <button
          onClick={handleToggleComplete}
          className={clsx(
            'flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5 transform hover:scale-110 active:scale-95',
            task.is_completed
              ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400 bg-white dark:bg-gray-700'
          )}
          title={task.is_completed ? '标记为未完成' : '标记为已完成'}
        >
          {task.is_completed && (
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <h3
          className={clsx(
            'font-medium text-sm leading-tight flex-1',
            task.is_completed
              ? 'line-through text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          )}
          title={task.title}
        >
          {truncateText(task.title, 40)}
        </h3>
      </div>

      {/* 描述 */}
      {task.description && (
        <p className={clsx(
          'text-xs text-gray-600 dark:text-gray-400 mb-3',
          task.is_completed && 'line-through'
        )}>
          {truncateText(task.description, 60)}
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
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {truncateText(tag, 8)}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* 时间和备注 */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(task.created_at)}</span>
          </div>
          {task.notes.length > 0 && (
            <span className="text-xs">{task.notes.length} 备注</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 可拖拽任务卡片包装器
 */
const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  index,
  isSelected,
  onTaskClick,
  onTaskEdit
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : 'all 0.2s ease'
          }}
          className={clsx(
            'mb-3',
            snapshot.isDragging && 'shadow-2xl z-50 opacity-90 bg-white dark:bg-gray-800 rounded-xl'
          )}
        >
          <TaskCard
            task={task}
            isSelected={isSelected}
            onTaskClick={onTaskClick}
            onTaskEdit={onTaskEdit}
          />
          {/* 拖拽时的背景遮罩 */}
          {snapshot.isDragging && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
          )}
        </div>
      )}
    </Draggable>
  );
};

/**
 * 任务看板视图组件
 */
export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  selectedTaskId,
  onTaskClick,
  onTaskEdit,
  className
}) => {
  const { toggleComplete, reorderTasks } = useTaskStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const groupedTasksRef = useRef<Record<string, Task[]>>({});

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback(async (result: DropResult) => {
    setIsDragging(false);
    
    const { destination, source, draggableId } = result;

    // 如果没有目标位置，说明拖拽被取消
    if (!destination) return;

    // 如果拖拽位置和列都没有变化
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    try {
      // 确保droppableId是有效的列ID
      const validColumnIds = ['todo', 'completed'];
      if (!validColumnIds.includes(destination.droppableId) || !validColumnIds.includes(source.droppableId)) {
        console.error('无效的droppableId:', { source: source.droppableId, destination: destination.droppableId });
        return;
      }

      // 跨列拖拽：改变任务完成状态
      if (destination.droppableId !== source.droppableId) {
        await toggleComplete(draggableId);
      } else {
        // 同列内拖拽：重新排序（暂时禁用以避免复杂性）
        console.log('同列拖拽暂时禁用，源列:', source.droppableId);
      }
    } catch (error) {
      console.error('拖拽操作失败:', error);
      // 重新加载任务以恢复正确状态
      groupedTasksRef.current = {};
    }
  }, [toggleComplete]);

  /**
   * 看板列配置 - 使用ref确保稳定性
   */
  const columnsRef = useRef<KanbanColumn[]>([
    {
      id: 'todo',
      title: '待办事项',
      icon: <Circle className="w-4 h-4" />,
      color: 'text-orange-600 dark:text-orange-400',
      filter: (task: Task) => !task.is_completed
    },
    {
      id: 'completed',
      title: '已完成',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 dark:text-green-400',
      filter: (task: Task) => task.is_completed
    }
  ]);

  const columns = columnsRef.current;

  /**
   * 按列分组任务 - 在拖拽时保持稳定
   */
  const groupedTasks = useMemo(() => {
    if (isDragging && Object.keys(groupedTasksRef.current).length > 0) {
      // 拖拽时使用缓存的分组，避免重新计算
      return groupedTasksRef.current;
    }
    
    const newGrouped = columns.reduce((acc, column) => {
      acc[column.id] = tasks.filter(column.filter).sort((a, b) => a.order_index - b.order_index);
      return acc;
    }, {} as Record<string, Task[]>);
    
    // 仅在非拖拽状态下更新缓存
    if (!isDragging) {
      groupedTasksRef.current = newGrouped;
    }
    
    return newGrouped;
  }, [tasks, isDragging, columns]);

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

  // 添加错误边界
  const [dragError, setDragError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  // 错误处理函数
  const handleDragError = useCallback((error: Error) => {
    console.error('拖拽错误:', error);
    setDragError(error.message);
    setIsDragging(false);
    // 清空缓存以强制重新渲染
    groupedTasksRef.current = {};
  }, []);

  // 重试函数
  const handleRetry = useCallback(() => {
    setDragError(null);
    setRetryCount(prev => prev + 1);
    groupedTasksRef.current = {};
  }, []);

  if (dragError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-lg font-medium">拖拽功能遇到问题</p>
        <p className="text-sm mt-1 text-center max-w-md">
          {retryCount > 2 ? '多次重试失败，请刷新页面' : '请稍后重试'}
        </p>
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={handleRetry}
            disabled={retryCount > 2}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            重新尝试 {retryCount > 0 && `(${retryCount})`}
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext 
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onBeforeCapture={() => {
        setDragError(null);
        // 确保开始拖拽前的状态是稳定的
        if (Object.keys(groupedTasksRef.current).length === 0) {
          groupedTasksRef.current = columns.reduce((acc, column) => {
            acc[column.id] = tasks.filter(column.filter).sort((a, b) => a.order_index - b.order_index);
            return acc;
          }, {} as Record<string, Task[]>);
        }
      }}
    >
      <div className={clsx('flex space-x-6 p-6 h-full overflow-x-auto', className)}>
        {columns.map((column) => {
          const columnTasks = groupedTasks[column.id] || [];
          
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-gray-50/70 dark:bg-gray-900/70 rounded-2xl p-4"
            >
              {/* 列头 */}
              <div className="flex items-center space-x-2 mb-4">
                <div className={clsx('p-2 rounded-xl bg-white/80 dark:bg-gray-800/80', column.color)}>
                  {column.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {column.title}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded-lg">
                  {columnTasks.length}
                </span>
              </div>

              {/* 可拖拽任务卡片列表 */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={clsx(
                      'min-h-[200px] max-h-[calc(100vh-200px)] overflow-y-auto transition-all duration-300',
                      snapshot.isDraggingOver && 'bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-2'
                    )}
                  >
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          {column.icon}
                        </div>
                        <p className="text-sm">暂无{column.title}</p>
                        {snapshot.isDraggingOver && (
                          <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                            在此处放置任务
                          </p>
                        )}
                      </div>
                    ) : (
                      columnTasks.map((task, index) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          isSelected={task.id === selectedTaskId}
                          onTaskClick={onTaskClick || (() => {})}
                          onTaskEdit={onTaskEdit || (() => {})}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
      
      {/* 拖拽提示 */}
      <div className="px-6 pb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        💡 提示：拖拽任务卡片可以改变状态或重新排序
      </div>
    </DragDropContext>
  );
};
