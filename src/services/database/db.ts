/**
 * 桌面TODO应用数据库配置
 * 使用Dexie.js操作IndexedDB
 * 
 * @author 桌面TODO团队
 */

import Dexie, { Table } from 'dexie';
import { Task, AppSettings, Priority } from '../../types';

/**
 * 数据库任务数据结构
 */
export interface TaskRow {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  order_index: number;
  tags: string[];
  notes: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
  is_completed: boolean;
}

/**
 * 数据库设置数据结构
 */
export interface SettingsRow {
  id: string;
  settings: AppSettings;
}

/**
 * 应用数据库类
 */
export class AppDatabase extends Dexie {
  /** 任务表 */
  tasks!: Table<TaskRow>;
  /** 设置表 */
  settings!: Table<SettingsRow>;

  constructor() {
    super('DeskTodoListDB');
    
    // 数据库版本1
    this.version(1).stores({
      tasks: 'id, title, priority, due_date, created_at, updated_at, completed_at, order_index, is_completed',
      settings: 'id'
    });

    // 数据迁移和初始化
    this.on('ready', async () => {
      // 检查是否需要初始化设置
      const settingsCount = await this.settings.count();
      if (settingsCount === 0) {
        await this.initializeDefaultSettings();
      }
    });
  }

  /**
   * 初始化默认设置
   */
  private async initializeDefaultSettings() {
    const defaultSettings: AppSettings = {
      theme: 'system',
      shortcuts: {
        new_task: 'CmdOrCtrl+N',
        search: 'CmdOrCtrl+F',
        toggle_complete: 'Space',
        delete_task: 'Delete',
        undo: 'CmdOrCtrl+Z',
        export_data: 'CmdOrCtrl+Shift+E',
        open_settings: 'CmdOrCtrl+,',
        clear_selection: 'Escape'
      },
      notifications_enabled: true,
      language: 'zh-CN',
      ui_preferences: {
        window_size: { width: 1000, height: 700 },
        window_position: { x: -1, y: -1 },
        sidebar_collapsed: false,
        task_view_mode: 'list',
        always_on_top: false
      },
      auto_backup: true,
      backup_interval: 24
    };

    await this.settings.add({
      id: 'default',
      settings: defaultSettings
    });
  }

  /**
   * 获取应用设置
   */
  async getSettings(): Promise<AppSettings | null> {
    const result = await this.settings.get('default');
    return result?.settings || null;
  }

  /**
   * 更新应用设置
   */
  async updateSettings(settings: AppSettings): Promise<void> {
    await this.settings.put({
      id: 'default',
      settings
    });
  }

  /**
   * 添加任务
   */
  async addTask(task: Task): Promise<void> {
    const taskRow: TaskRow = {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at,
      order_index: task.order_index,
      tags: task.tags,
      notes: task.notes,
      is_completed: task.is_completed
    };
    
    await this.tasks.add(taskRow);
  }

  /**
   * 更新任务
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    await this.tasks.update(id, updates);
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<void> {
    await this.tasks.delete(id);
  }

  /**
   * 获取所有任务
   */
  async getAllTasks(): Promise<Task[]> {
    const taskRows = await this.tasks.orderBy('order_index').toArray();
    return taskRows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      due_date: row.due_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at,
      order_index: row.order_index,
      tags: row.tags,
      notes: row.notes,
      is_completed: row.is_completed
    }));
  }

  /**
   * 按条件搜索任务
   */
  async searchTasks(query: string): Promise<Task[]> {
    const allTasks = await this.getAllTasks();
    const lowerQuery = query.toLowerCase();
    
    return allTasks.filter(task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 清空已完成任务
   */
  async clearCompletedTasks(): Promise<void> {
    await this.tasks.where('is_completed').equals(1).delete();
  }

  /**
   * 导出所有数据
   */
  async exportData(): Promise<{tasks: Task[], settings: AppSettings}> {
    const tasks = await this.getAllTasks();
    const settings = await this.getSettings();
    
    return {
      tasks,
      settings: settings || {} as AppSettings
    };
  }
}

export const db = new AppDatabase();
