/**
 * 可拖拽的任务列表组件
 * 支持通过拖拽重新排序任务
 * 
 * @author 桌面TODO团队
 */

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { TaskItem } from './TaskItem';
import clsx from 'clsx';

/**
 * 可拖拽任务列表组件Props
 */
interface DraggableTaskListProps {
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
 * 可拖拽任务项组件
 */
interface DraggableTaskItemProps {
  task: Task;
  index: number;
  isSelected: boolean;
  onTaskClick?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
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
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : undefined
          }}
          className={clsx(
            'group relative',
            !snapshot.isDragging && 'transition-all duration-300',
            snapshot.isDragging && 'shadow-2xl z-50 opacity-90'
          )}
        >
          {/* 拖拽手柄 */}
          <div
            {...provided.dragHandleProps}
            className={clsx(
              'absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10',
              'p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              snapshot.isDragging && 'opacity-100'
            )}
            title="拖拽排序"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* 任务项，添加左边距为拖拽手柄留空间 */}
          <div className="ml-8">
            <TaskItem
              task={task}
              isSelected={isSelected}
              onClick={onTaskClick ? (task) => onTaskClick(task.id) : undefined}
              onDoubleClick={onTaskEdit ? (task) => onTaskEdit(task.id) : undefined}
              className={clsx(
                'transition-all duration-300',
                snapshot.isDragging && 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
              )}
            />
          </div>

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
 * 可拖拽任务列表组件
 */
export const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
  tasks,
  selectedTaskId,
  onTaskClick,
  onTaskEdit,
  className
}) => {
  const { reorderTasks } = useTaskStore();

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // 如果没有目标位置，说明拖拽被取消
    if (!destination) return;

    // 如果拖拽位置没有变化
    if (destination.index === source.index) return;

    try {
      // 重新排序任务
      await reorderTasks(source.index, destination.index);
    } catch (error) {
      console.error('任务排序失败:', error);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <GripVertical className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">暂无任务</p>
        <p className="text-sm mt-1">添加任务后可以拖拽排序</p>
      </div>
    );
  }

  return (
    <div className={clsx('p-6', className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="task-list">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={clsx(
                'space-y-4 min-h-[200px] transition-all duration-300',
                snapshot.isDraggingOver && 'bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl p-4'
              )}
            >
              {tasks.map((task, index) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  isSelected={task.id === selectedTaskId}
                  onTaskClick={onTaskClick}
                  onTaskEdit={onTaskEdit}
                />
              ))}
              {provided.placeholder}

              {/* 拖拽提示 */}
              {snapshot.isDraggingOver && (
                <div className="flex items-center justify-center py-8 text-blue-600 dark:text-blue-400">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <GripVertical className="w-4 h-4" />
                    <span>在此处放置任务</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
