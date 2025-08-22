/**
 * 桌面TODO应用的数据类型定义
 * 
 * @author 桌面TODO团队
 */

/**
 * 任务优先级枚举
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * 主题模式枚举
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 任务视图模式枚举
 */
export type TaskViewMode = 'list' | 'grid' | 'kanban';

/**
 * 任务筛选状态枚举
 */
export type TaskFilter = 'all' | 'active' | 'completed';

/**
 * 任务备注数据结构
 */
export interface Note {
  /** 备注唯一标识符 */
  id: string;
  /** 备注内容 */
  content: string;
  /** 创建时间（ISO8601格式） */
  created_at: string;
}

/**
 * 任务数据结构
 */
export interface Task {
  /** 任务唯一标识符（UUID v4） */
  id: string;
  /** 任务标题（必填，最大200字符） */
  title: string;
  /** 任务描述（可选，最大1000字符） */
  description?: string;
  /** 优先级 */
  priority: Priority;
  /** 截止日期（ISO8601格式） */
  due_date?: string;
  /** 创建时间（ISO8601格式） */
  created_at: string;
  /** 更新时间（ISO8601格式） */
  updated_at: string;
  /** 完成时间（ISO8601格式） */
  completed_at?: string;
  /** 备注列表 */
  notes: Note[];
  /** 排序索引 */
  order_index: number;
  /** 标签列表 */
  tags: string[];
  /** 完成状态 */
  is_completed: boolean;
}

/**
 * 快捷键配置
 */
export interface Shortcuts {
  /** 新建任务 */
  new_task: string;
  /** 搜索 */
  search: string;
  /** 切换完成状态 */
  toggle_complete: string;
  /** 删除任务 */
  delete_task: string;
  /** 撤销操作 */
  undo: string;
  /** 导出数据 */
  export_data: string;
  /** 打开设置 */
  open_settings: string;
  /** 清除选择 */
  clear_selection: string;
}

/**
 * UI偏好设置
 */
export interface UIPreferences {
  /** 窗口大小 */
  window_size: { width: number; height: number };
  /** 窗口位置 */
  window_position: { x: number; y: number };
  /** 侧边栏是否折叠 */
  sidebar_collapsed: boolean;
  /** 任务视图模式 */
  task_view_mode: TaskViewMode;
  /** 是否始终置顶 */
  always_on_top: boolean;
}

/**
 * 应用设置
 */
export interface AppSettings {
  /** 主题设置 */
  theme: Theme;
  /** 快捷键映射 */
  shortcuts: Shortcuts;
  /** 通知开关 */
  notifications_enabled: boolean;
  /** 语言设置 */
  language: string;
  /** UI偏好设置 */
  ui_preferences: UIPreferences;
  /** 自动备份开关 */
  auto_backup: boolean;
  /** 备份间隔（小时） */
  backup_interval: number;
}

/**
 * 应用元数据
 */
export interface AppMetadata {
  /** 最后备份时间 */
  last_backup: string;
  /** 总计创建任务数 */
  total_tasks_created: number;
  /** 应用安装日期 */
  app_install_date: string;
}

/**
 * 应用数据文件结构
 */
export interface AppData {
  /** 数据版本号 */
  version: string;
  /** 任务列表 */
  tasks: Task[];
  /** 应用设置 */
  settings: AppSettings;
  /** 元数据 */
  metadata: AppMetadata;
}

/**
 * 错误报告数据结构
 */
export interface ErrorReport {
  /** 错误ID */
  error_id: string;
  /** 时间戳 */
  timestamp: string;
  /** 错误类型 */
  error_type: 'crash' | 'exception' | 'performance';
  /** 错误消息 */
  error_message: string;
  /** 堆栈跟踪 */
  stack_trace?: string;
  /** 用户代理 */
  user_agent: string;
  /** 应用版本 */
  app_version: string;
}

/**
 * 撤销操作类型
 */
export type UndoActionType = 
  | 'add_task'
  | 'update_task'
  | 'delete_task'
  | 'toggle_complete'
  | 'reorder_tasks'
  | 'clear_completed';

/**
 * 撤销操作数据结构
 */
export interface UndoAction {
  /** 操作ID */
  id: string;
  /** 操作类型 */
  type: UndoActionType;
  /** 操作时间戳 */
  timestamp: string;
  /** 操作描述 */
  description: string;
  /** 撤销数据 */
  undoData: {
    /** 受影响的任务数据 */
    tasks?: Task[];
    /** 任务ID（用于单任务操作） */
    taskId?: string;
    /** 原始任务数据（用于更新/删除操作） */
    originalTask?: Task;
    /** 原始任务列表（用于重排序操作） */
    originalTasks?: Task[];
    /** 其他撤销相关数据 */
    [key: string]: any;
  };
}
