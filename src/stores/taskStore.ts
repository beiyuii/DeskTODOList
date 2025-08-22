/**
 * 任务状态管理Store
 * 使用Zustand进行状态管理
 * 
 * @author 桌面TODO团队
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Task, TaskFilter, Priority, UndoAction, UndoActionType } from '../types';
import { generateId, getCurrentISOString } from '../utils';
import { db } from '../services/database/db';

/**
 * 任务Store接口定义
 */
interface TaskStore {
  // 状态
  /** 任务列表 */
  tasks: Task[];
  /** 当前筛选条件 */
  filter: TaskFilter;
  /** 搜索关键词 */
  searchQuery: string;
  /** 选中的任务ID */
  selectedTaskId: string | null;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 撤销历史记录 */
  undoHistory: UndoAction[];
  /** 当前是否可以撤销 */
  canUndo: boolean;

  // 操作方法
  /** 设置任务列表 */
  setTasks: (tasks: Task[]) => void;
  /** 添加任务 */
  addTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order_index'>) => Promise<void>;
  /** 更新任务 */
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  /** 删除任务 */
  deleteTask: (id: string) => Promise<void>;
  /** 切换任务完成状态 */
  toggleComplete: (id: string) => Promise<void>;
  /** 重新排序任务 */
  reorderTasks: (startIndex: number, endIndex: number) => Promise<void>;
  /** 设置筛选条件 */
  setFilter: (filter: TaskFilter) => void;
  /** 设置搜索关键词 */
  setSearchQuery: (query: string) => void;
  /** 设置选中任务 */
  setSelectedTask: (id: string | null) => void;
  /** 清空已完成任务 */
  clearCompleted: () => Promise<void>;
  /** 从数据库加载任务 */
  loadTasks: () => Promise<void>;
  /** 获取筛选后的任务 */
  getFilteredTasks: () => Task[];
  /** 执行撤销操作 */
  undo: () => Promise<void>;
  /** 添加撤销记录 */
  addUndoAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void;
  /** 清空撤销历史 */
  clearUndoHistory: () => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误信息 */
  setError: (error: string | null) => void;
}

/**
 * 创建任务Store
 */
export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        tasks: [],
        filter: 'all',
        searchQuery: '',
        selectedTaskId: null,
        isLoading: false,
        error: null,
        undoHistory: [],
        canUndo: false,

        // 设置任务列表
        setTasks: (tasks) => {
          set({ tasks }, false, 'setTasks');
        },

        // 添加任务
        addTask: async (taskData) => {
          try {
            set({ isLoading: true, error: null });
            
            const maxOrderIndex = Math.max(...get().tasks.map(t => t.order_index), 0);
            const newTask: Task = {
              id: generateId(),
              created_at: getCurrentISOString(),
              updated_at: getCurrentISOString(),
              order_index: maxOrderIndex + 1,
              ...taskData,
              // 确保这些属性如果没有在taskData中指定，则使用默认值
              is_completed: taskData.is_completed ?? false,
              notes: taskData.notes ?? [],
              tags: taskData.tags ?? []
            };

            // 保存到数据库
            await db.tasks.add(newTask);
            
            // 更新状态
            set(state => ({
              tasks: [newTask, ...state.tasks],
              isLoading: false
            }), false, 'addTask');

            // 记录撤销操作
            get().addUndoAction({
              type: 'add_task',
              description: `添加任务"${newTask.title}"`,
              undoData: {
                taskId: newTask.id
              }
            });

          } catch (error) {
            console.error('添加任务失败:', error);
            set({ 
              error: '添加任务失败，请重试', 
              isLoading: false 
            });
          }
        },

        // 更新任务
        updateTask: async (id, updates) => {
          try {
            set({ isLoading: true, error: null });
            
            // 获取原始任务数据用于撤销
            const originalTask = get().tasks.find(t => t.id === id);
            if (!originalTask) {
              throw new Error('任务不存在');
            }
            
            const updatedTask = {
              ...updates,
              updated_at: getCurrentISOString()
            };

            // 更新数据库
            await db.tasks.update(id, updatedTask);
            
            // 更新状态
            set(state => ({
              tasks: state.tasks.map(task =>
                task.id === id ? { ...task, ...updatedTask } : task
              ),
              isLoading: false
            }), false, 'updateTask');

            // 记录撤销操作
            get().addUndoAction({
              type: 'update_task',
              description: `更新任务"${originalTask.title}"`,
              undoData: {
                originalTask: { ...originalTask }
              }
            });

          } catch (error) {
            console.error('更新任务失败:', error);
            set({ 
              error: '更新任务失败，请重试', 
              isLoading: false 
            });
          }
        },

        // 删除任务
        deleteTask: async (id) => {
          try {
            set({ isLoading: true, error: null });
            
            // 获取原始任务数据用于撤销
            const originalTask = get().tasks.find(t => t.id === id);
            if (!originalTask) {
              throw new Error('任务不存在');
            }
            
            // 从数据库删除
            await db.tasks.delete(id);
            
            // 更新状态
            set(state => ({
              tasks: state.tasks.filter(task => task.id !== id),
              selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
              isLoading: false
            }), false, 'deleteTask');

            // 记录撤销操作
            get().addUndoAction({
              type: 'delete_task',
              description: `删除任务"${originalTask.title}"`,
              undoData: {
                originalTask: { ...originalTask }
              }
            });

          } catch (error) {
            console.error('删除任务失败:', error);
            set({ 
              error: '删除任务失败，请重试', 
              isLoading: false 
            });
          }
        },

        // 切换任务完成状态
        toggleComplete: async (id) => {
          try {
            set({ isLoading: true, error: null });
            
            const task = get().tasks.find(t => t.id === id);
            if (!task) {
              set({ isLoading: false });
              return;
            }

            // 保存原始状态用于撤销
            const originalTask = { ...task };

            const updates = {
              is_completed: !task.is_completed,
              completed_at: !task.is_completed ? getCurrentISOString() : undefined,
              updated_at: getCurrentISOString()
            };

            // 更新数据库
            await db.tasks.update(id, updates);
            
            // 更新状态
            set(state => ({
              tasks: state.tasks.map(t =>
                t.id === id ? { ...t, ...updates } : t
              ),
              isLoading: false
            }), false, 'toggleComplete');

            // 记录撤销操作
            get().addUndoAction({
              type: 'toggle_complete',
              description: `${!task.is_completed ? '完成' : '取消完成'}任务"${task.title}"`,
              undoData: {
                originalTask
              }
            });

          } catch (error) {
            console.error('切换任务状态失败:', error);
            set({ 
              error: '切换任务状态失败',
              isLoading: false 
            });
          }
        },

        // 重新排序任务
        reorderTasks: async (startIndex, endIndex) => {
          try {
            set({ isLoading: true, error: null });
            
            const originalTasks = [...get().tasks];
            const tasks = [...originalTasks];
            const [reorderedTask] = tasks.splice(startIndex, 1);
            tasks.splice(endIndex, 0, reorderedTask);

            // 更新排序索引
            const updatedTasks = tasks.map((task, index) => ({
              ...task,
              order_index: index,
              updated_at: getCurrentISOString()
            }));

            // 批量更新数据库
            await Promise.all(
              updatedTasks.map(task => 
                db.tasks.update(task.id, { 
                  order_index: task.order_index, 
                  updated_at: task.updated_at 
                })
              )
            );

            set({ 
              tasks: updatedTasks, 
              isLoading: false 
            }, false, 'reorderTasks');

            // 记录撤销操作
            get().addUndoAction({
              type: 'reorder_tasks',
              description: '重新排序任务',
              undoData: {
                originalTasks: originalTasks.map(task => ({ ...task }))
              }
            });

          } catch (error) {
            console.error('重新排序失败:', error);
            set({ 
              error: '重新排序失败，请重试',
              isLoading: false 
            });
          }
        },

        // 设置筛选条件
        setFilter: (filter) => {
          set({ filter }, false, 'setFilter');
        },

        // 设置搜索关键词
        setSearchQuery: (searchQuery) => {
          set({ searchQuery }, false, 'setSearchQuery');
        },

        // 设置选中任务
        setSelectedTask: (selectedTaskId) => {
          set({ selectedTaskId }, false, 'setSelectedTask');
        },

        // 清空已完成任务
        clearCompleted: async () => {
          try {
            set({ isLoading: true, error: null });
            
            const completedTasks = get().tasks.filter(task => task.is_completed);
            
            if (completedTasks.length === 0) {
              set({ isLoading: false });
              return;
            }

            const completedTaskIds = completedTasks.map(task => task.id);

            // 从数据库批量删除
            await Promise.all(
              completedTaskIds.map(id => db.tasks.delete(id))
            );

            // 更新状态
            set(state => ({
              tasks: state.tasks.filter(task => !task.is_completed),
              isLoading: false
            }), false, 'clearCompleted');

            // 记录撤销操作
            get().addUndoAction({
              type: 'clear_completed',
              description: `清空${completedTasks.length}个已完成任务`,
              undoData: {
                tasks: completedTasks.map(task => ({ ...task }))
              }
            });

          } catch (error) {
            console.error('清空已完成任务失败:', error);
            set({ 
              error: '清空已完成任务失败，请重试', 
              isLoading: false 
            });
          }
        },

        // 从数据库加载任务
        loadTasks: async () => {
          try {
            set({ isLoading: true, error: null });
            
            const tasks = await db.tasks.orderBy('order_index').toArray();
            
            set({ 
              tasks, 
              isLoading: false 
            }, false, 'loadTasks');

          } catch (error) {
            console.error('加载任务失败:', error);
            set({ 
              error: '加载任务失败，请刷新页面重试', 
              isLoading: false 
            });
          }
        },

        // 获取筛选后的任务
        getFilteredTasks: () => {
          const { tasks, filter, searchQuery } = get();
          
          let filteredTasks = tasks;

          // 按完成状态筛选
          if (filter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.is_completed);
          } else if (filter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.is_completed);
          }

          // 按搜索关键词筛选
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredTasks = filteredTasks.filter(task =>
              task.title.toLowerCase().includes(query) ||
              task.description?.toLowerCase().includes(query) ||
              task.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }

          return filteredTasks;
        },

        // 设置加载状态
        setLoading: (isLoading) => {
          set({ isLoading }, false, 'setLoading');
        },

        // 设置错误信息
        setError: (error) => {
          set({ error }, false, 'setError');
        },

        // 添加撤销记录
        addUndoAction: (action) => {
          const undoAction: UndoAction = {
            id: generateId(),
            timestamp: getCurrentISOString(),
            ...action
          };
          
          set(state => {
            const newHistory = [...state.undoHistory, undoAction];
            // 限制撤销历史记录数量（最多保留20条）
            if (newHistory.length > 20) {
              newHistory.shift();
            }
            
            return {
              undoHistory: newHistory,
              canUndo: newHistory.length > 0
            };
          }, false, 'addUndoAction');
        },

        // 清空撤销历史
        clearUndoHistory: () => {
          set({ undoHistory: [], canUndo: false }, false, 'clearUndoHistory');
        },

        // 执行撤销操作
        undo: async () => {
          const { undoHistory } = get();
          if (undoHistory.length === 0) return;

          const lastAction = undoHistory[undoHistory.length - 1];
          
          try {
            set({ isLoading: true, error: null });

            switch (lastAction.type) {
              case 'add_task':
                // 撤销添加任务：删除该任务
                if (lastAction.undoData.taskId) {
                  await db.tasks.delete(lastAction.undoData.taskId);
                  set(state => ({
                    tasks: state.tasks.filter(t => t.id !== lastAction.undoData.taskId),
                    isLoading: false
                  }));
                }
                break;

              case 'delete_task':
                // 撤销删除任务：恢复该任务
                if (lastAction.undoData.originalTask) {
                  await db.tasks.add(lastAction.undoData.originalTask);
                  set(state => ({
                    tasks: [lastAction.undoData.originalTask!, ...state.tasks]
                      .sort((a, b) => a.order_index - b.order_index),
                    isLoading: false
                  }));
                }
                break;

              case 'update_task':
                // 撤销更新任务：恢复原始数据
                if (lastAction.undoData.originalTask) {
                  const { id, ...updateData } = lastAction.undoData.originalTask;
                  await db.tasks.update(id, updateData);
                  set(state => ({
                    tasks: state.tasks.map(t => 
                      t.id === lastAction.undoData.originalTask!.id 
                        ? lastAction.undoData.originalTask! 
                        : t
                    ),
                    isLoading: false
                  }));
                }
                break;

              case 'toggle_complete':
                // 撤销切换完成状态：恢复原始状态
                if (lastAction.undoData.originalTask) {
                  const task = lastAction.undoData.originalTask;
                  await db.tasks.update(task.id, { 
                    is_completed: task.is_completed,
                    updated_at: getCurrentISOString()
                  });
                  set(state => ({
                    tasks: state.tasks.map(t => 
                      t.id === task.id 
                        ? { ...t, is_completed: task.is_completed, updated_at: getCurrentISOString() } 
                        : t
                    ),
                    isLoading: false
                  }));
                }
                break;

              case 'reorder_tasks':
                // 撤销重排序：恢复原始顺序
                if (lastAction.undoData.originalTasks) {
                  const tasks = lastAction.undoData.originalTasks;
                  await Promise.all(tasks.map(task => 
                    db.tasks.update(task.id, { order_index: task.order_index })
                  ));
                  set({ 
                    tasks: [...tasks].sort((a, b) => a.order_index - b.order_index),
                    isLoading: false 
                  });
                }
                break;

              case 'clear_completed':
                // 撤销清空已完成：恢复已完成的任务
                if (lastAction.undoData.tasks) {
                  await Promise.all(lastAction.undoData.tasks.map(task => db.tasks.add(task)));
                  set(state => ({
                    tasks: [...state.tasks, ...lastAction.undoData.tasks!]
                      .sort((a, b) => a.order_index - b.order_index),
                    isLoading: false
                  }));
                }
                break;
            }

            // 移除已执行的撤销记录
            set(state => {
              const newHistory = state.undoHistory.slice(0, -1);
              return {
                undoHistory: newHistory,
                canUndo: newHistory.length > 0
              };
            });

          } catch (error) {
            console.error('撤销操作失败:', error);
            set({ 
              error: '撤销操作失败',
              isLoading: false 
            });
          }
        }
      }),
      {
        name: 'task-store',
        // 只持久化基本状态，不持久化临时状态
        partialize: (state) => ({
          filter: state.filter,
          searchQuery: state.searchQuery
        })
      }
    ),
    {
      name: 'task-store'
    }
  )
);
