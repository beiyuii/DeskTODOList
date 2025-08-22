/**
 * 国际化服务
 * 提供多语言支持功能
 * 
 * @author 桌面TODO团队
 */

import { useSettingsStore } from '../stores/settingsStore';

/**
 * 支持的语言类型
 */
export type SupportedLanguage = 'zh-CN' | 'en-US';

/**
 * 翻译键值对接口
 */
export interface TranslationKeys {
  // 应用基础
  app: {
    name: string;
    version: string;
  };
  
  // 通用操作
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    loading: string;
    search: string;
    clear: string;
    reset: string;
    import: string;
    export: string;
    backup: string;
    restore: string;
    settings: string;
    help: string;
    yes: string;
    no: string;
  };

  // 任务相关
  task: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    tags: string;
    notes: string;
    completed: string;
    pending: string;
    overdue: string;
    
    // 优先级
    priority_low: string;
    priority_medium: string;
    priority_high: string;
    
    // 操作
    addTask: string;
    editTask: string;
    deleteTask: string;
    completeTask: string;
    uncompleteTask: string;
    duplicateTask: string;
    
    // 筛选
    filterAll: string;
    filterActive: string;
    filterCompleted: string;
    
    // 视图
    listView: string;
    gridView: string;
    kanbanView: string;
    
    // 状态
    noTasks: string;
    noTasksDesc: string;
    taskCount: string;
    completedCount: string;
  };

  // 设置相关
  settings: {
    title: string;
    general: string;
    shortcuts: string;
    dataManagement: string;
    
    // 外观设置
    appearance: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    taskViewMode: string;
    
    // 窗口设置
    window: string;
    alwaysOnTop: string;
    alwaysOnTopDesc: string;
    
    // 通知设置
    notifications: string;
    systemNotifications: string;
    systemNotificationsDesc: string;
    
    // 备份设置
    autoBackup: string;
    autoBackupDesc: string;
    backupInterval: string;
    backupStatus: string;
    backupSuccessRate: string;
    lastBackup: string;
    manualBackup: string;
    backingUp: string;
    
    // 快捷键设置
    shortcutsDesc: string;
    shortcutDisabledInInput: string;
    
    // 语言设置
    language: string;
    languageDesc: string;
  };

  // 数据管理
  dataManager: {
    title: string;
    overview: string;
    export: string;
    import: string;
    
    // 导出
    exportFormat: string;
    exportAll: string;
    exportSettings: string;
    exportSuccess: string;
    exportFailed: string;
    
    // 导入
    importAll: string;
    importSettings: string;
    importSuccess: string;
    importFailed: string;
    
    // 格式
    formatJson: string;
    formatCsv: string;
    formatTxt: string;
  };

  // 通知消息
  notifications: {
    taskAdded: string;
    taskCompleted: string;
    taskDeleted: string;
    taskUpdated: string;
    operationUndone: string;
    batchOperation: string;
    dataExported: string;
    dataImported: string;
    backupCompleted: string;
    backupFailed: string;
    permissionDenied: string;
    permissionGranted: string;
  };

  // 错误消息
  errors: {
    unknown: string;
    networkError: string;
    invalidFormat: string;
    fileNotFound: string;
    permissionDenied: string;
    quotaExceeded: string;
    taskNotFound: string;
    saveFailed: string;
    loadFailed: string;
  };

  // 确认对话框
  confirmations: {
    deleteTask: string;
    deleteAllCompleted: string;
    clearAllData: string;
    importData: string;
    restoreBackup: string;
    resetSettings: string;
  };

  // 快捷键操作
  shortcuts: {
    newTask: string;
    search: string;
    toggleComplete: string;
    deleteTask: string;
    undo: string;
    exportData: string;
    openSettings: string;
    clearSelection: string;
  };

  // 时间相关
  time: {
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    lastMonth: string;
    custom: string;
    
    // 相对时间
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    yearsAgo: string;
  };
}

/**
 * 国际化服务类
 */
class I18nService {
  private currentLanguage: SupportedLanguage = 'zh-CN';
  private translations: Record<SupportedLanguage, TranslationKeys>;

  constructor() {
    this.translations = {
      'zh-CN': this.getChineseTranslations(),
      'en-US': this.getEnglishTranslations()
    };
    
    // 从设置中获取当前语言
    this.updateLanguage();
  }

  /**
   * 更新当前语言
   */
  updateLanguage(): void {
    const settings = useSettingsStore.getState().settings;
    this.currentLanguage = settings.language as SupportedLanguage;
  }

  /**
   * 获取翻译文本
   */
  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key; // 返回键名作为后备
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): { code: SupportedLanguage; name: string; nativeName: string }[] {
    return [
      { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
      { code: 'en-US', name: 'English (US)', nativeName: 'English' }
    ];
  }

  /**
   * 设置语言
   */
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * 中文翻译
   */
  private getChineseTranslations(): TranslationKeys {
    return {
      app: {
        name: 'DeskTodoList',
        version: 'v1.0.0'
      },
      common: {
        ok: '确定',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        close: '关闭',
        confirm: '确认',
        loading: '加载中...',
        search: '搜索',
        clear: '清除',
        reset: '重置',
        import: '导入',
        export: '导出',
        backup: '备份',
        restore: '恢复',
        settings: '设置',
        help: '帮助',
        yes: '是',
        no: '否'
      },
      task: {
        title: '标题',
        description: '描述',
        priority: '优先级',
        dueDate: '截止日期',
        tags: '标签',
        notes: '备注',
        completed: '已完成',
        pending: '待办事项',
        overdue: '已过期',
        
        priority_low: '低优先级',
        priority_medium: '中优先级', 
        priority_high: '高优先级',
        
        addTask: '添加新任务...',
        editTask: '编辑任务',
        deleteTask: '删除任务',
        completeTask: '完成任务',
        uncompleteTask: '取消完成',
        duplicateTask: '复制任务',
        
        filterAll: '全部任务',
        filterActive: '待办事项',
        filterCompleted: '已完成',
        
        listView: '列表视图',
        gridView: '网格视图',
        kanbanView: '看板视图',
        
        noTasks: '暂无任务',
        noTasksDesc: '开始添加您的第一个任务吧',
        taskCount: '个任务',
        completedCount: '个已完成'
      },
      settings: {
        title: '应用设置',
        general: '常规设置',
        shortcuts: '快捷键',
        dataManagement: '数据管理',
        
        appearance: '外观设置',
        theme: '主题',
        themeLight: '明亮模式',
        themeDark: '暗黑模式',
        themeSystem: '跟随系统',
        taskViewMode: '任务视图模式',
        
        window: '窗口设置',
        alwaysOnTop: '窗口置顶',
        alwaysOnTopDesc: '保持应用窗口始终在最前面',
        
        notifications: '通知设置',
        systemNotifications: '系统通知',
        systemNotificationsDesc: '接收任务提醒和系统通知',
        
        autoBackup: '自动备份',
        autoBackupDesc: '定期自动备份任务数据',
        backupInterval: '备份间隔',
        backupStatus: '备份状态',
        backupSuccessRate: '成功率',
        lastBackup: '最近备份',
        manualBackup: '立即备份',
        backingUp: '备份中...',
        
        shortcutsDesc: '自定义应用快捷键',
        shortcutDisabledInInput: '在输入框内快捷键将被禁用',
        
        language: '语言',
        languageDesc: '选择应用界面语言'
      },
      dataManager: {
        title: '数据管理',
        overview: '数据概览',
        export: '导出数据',
        import: '导入数据',
        
        exportFormat: '导出格式',
        exportAll: '导出所有数据',
        exportSettings: '仅导出设置',
        exportSuccess: '数据导出成功',
        exportFailed: '数据导出失败',
        
        importAll: '导入所有数据',
        importSettings: '仅导入设置',
        importSuccess: '数据导入成功',
        importFailed: '数据导入失败',
        
        formatJson: 'JSON 格式',
        formatCsv: 'CSV 格式',
        formatTxt: '文本格式'
      },
      notifications: {
        taskAdded: '新任务已添加',
        taskCompleted: '任务已完成',
        taskDeleted: '任务已删除',
        taskUpdated: '任务已更新',
        operationUndone: '操作已撤销',
        batchOperation: '批量操作完成',
        dataExported: '数据导出成功',
        dataImported: '数据导入成功',
        backupCompleted: '备份完成',
        backupFailed: '备份失败',
        permissionDenied: '通知权限被拒绝，请在浏览器设置中手动开启',
        permissionGranted: '通知已启用，您将收到任务相关的桌面通知'
      },
      errors: {
        unknown: '未知错误',
        networkError: '网络错误',
        invalidFormat: '无效的文件格式',
        fileNotFound: '文件未找到',
        permissionDenied: '权限被拒绝',
        quotaExceeded: '存储空间不足',
        taskNotFound: '任务不存在',
        saveFailed: '保存失败',
        loadFailed: '加载失败'
      },
      confirmations: {
        deleteTask: '确定要删除这个任务吗？',
        deleteAllCompleted: '确定要删除所有已完成的任务吗？',
        clearAllData: '确定要清除所有数据吗？此操作不可撤销。',
        importData: '导入将替换当前所有数据，确定继续吗？',
        restoreBackup: '确定要恢复此备份吗？当前数据将被替换。',
        resetSettings: '确定要重置所有设置吗？'
      },
      shortcuts: {
        newTask: '新建任务',
        search: '搜索任务',
        toggleComplete: '切换完成状态',
        deleteTask: '删除任务',
        undo: '撤销操作',
        exportData: '导出数据',
        openSettings: '打开设置',
        clearSelection: '清除选择'
      },
      time: {
        today: '今天',
        yesterday: '昨天',
        tomorrow: '明天',
        thisWeek: '本周',
        lastWeek: '上周',
        thisMonth: '本月',
        lastMonth: '上月',
        custom: '自定义',
        
        justNow: '刚刚',
        minutesAgo: '分钟前',
        hoursAgo: '小时前',
        daysAgo: '天前',
        weeksAgo: '周前',
        monthsAgo: '月前',
        yearsAgo: '年前'
      }
    };
  }

  /**
   * 英文翻译
   */
  private getEnglishTranslations(): TranslationKeys {
    return {
      app: {
        name: 'DeskTodoList',
        version: 'v1.0.0'
      },
      common: {
        ok: 'OK',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        close: 'Close',
        confirm: 'Confirm',
        loading: 'Loading...',
        search: 'Search',
        clear: 'Clear',
        reset: 'Reset',
        import: 'Import',
        export: 'Export',
        backup: 'Backup',
        restore: 'Restore',
        settings: 'Settings',
        help: 'Help',
        yes: 'Yes',
        no: 'No'
      },
      task: {
        title: 'Title',
        description: 'Description',
        priority: 'Priority',
        dueDate: 'Due Date',
        tags: 'Tags',
        notes: 'Notes',
        completed: 'Completed',
        pending: 'Pending',
        overdue: 'Overdue',
        
        priority_low: 'Low Priority',
        priority_medium: 'Medium Priority',
        priority_high: 'High Priority',
        
        addTask: 'Add new task...',
        editTask: 'Edit Task',
        deleteTask: 'Delete Task',
        completeTask: 'Complete Task',
        uncompleteTask: 'Mark as Incomplete',
        duplicateTask: 'Duplicate Task',
        
        filterAll: 'All Tasks',
        filterActive: 'Active',
        filterCompleted: 'Completed',
        
        listView: 'List View',
        gridView: 'Grid View',
        kanbanView: 'Kanban View',
        
        noTasks: 'No tasks',
        noTasksDesc: 'Start by adding your first task',
        taskCount: ' tasks',
        completedCount: ' completed'
      },
      settings: {
        title: 'App Settings',
        general: 'General',
        shortcuts: 'Shortcuts',
        dataManagement: 'Data Management',
        
        appearance: 'Appearance',
        theme: 'Theme',
        themeLight: 'Light Mode',
        themeDark: 'Dark Mode',
        themeSystem: 'Follow System',
        taskViewMode: 'Task View Mode',
        
        window: 'Window',
        alwaysOnTop: 'Always on Top',
        alwaysOnTopDesc: 'Keep app window always in front',
        
        notifications: 'Notifications',
        systemNotifications: 'System Notifications',
        systemNotificationsDesc: 'Receive task reminders and system notifications',
        
        autoBackup: 'Auto Backup',
        autoBackupDesc: 'Automatically backup task data periodically',
        backupInterval: 'Backup Interval',
        backupStatus: 'Backup Status',
        backupSuccessRate: 'Success Rate',
        lastBackup: 'Last Backup',
        manualBackup: 'Backup Now',
        backingUp: 'Backing up...',
        
        shortcutsDesc: 'Customize application shortcuts',
        shortcutDisabledInInput: 'Shortcuts are disabled in input fields',
        
        language: 'Language',
        languageDesc: 'Select application interface language'
      },
      dataManager: {
        title: 'Data Management',
        overview: 'Data Overview',
        export: 'Export Data',
        import: 'Import Data',
        
        exportFormat: 'Export Format',
        exportAll: 'Export All Data',
        exportSettings: 'Export Settings Only',
        exportSuccess: 'Data exported successfully',
        exportFailed: 'Data export failed',
        
        importAll: 'Import All Data',
        importSettings: 'Import Settings Only',
        importSuccess: 'Data imported successfully',
        importFailed: 'Data import failed',
        
        formatJson: 'JSON Format',
        formatCsv: 'CSV Format',
        formatTxt: 'Text Format'
      },
      notifications: {
        taskAdded: 'New task added',
        taskCompleted: 'Task completed',
        taskDeleted: 'Task deleted',
        taskUpdated: 'Task updated',
        operationUndone: 'Operation undone',
        batchOperation: 'Batch operation completed',
        dataExported: 'Data exported successfully',
        dataImported: 'Data imported successfully',
        backupCompleted: 'Backup completed',
        backupFailed: 'Backup failed',
        permissionDenied: 'Notification permission denied. Please enable it in browser settings.',
        permissionGranted: 'Notifications enabled. You will receive desktop notifications for tasks.'
      },
      errors: {
        unknown: 'Unknown error',
        networkError: 'Network error',
        invalidFormat: 'Invalid file format',
        fileNotFound: 'File not found',
        permissionDenied: 'Permission denied',
        quotaExceeded: 'Storage quota exceeded',
        taskNotFound: 'Task not found',
        saveFailed: 'Save failed',
        loadFailed: 'Load failed'
      },
      confirmations: {
        deleteTask: 'Are you sure you want to delete this task?',
        deleteAllCompleted: 'Are you sure you want to delete all completed tasks?',
        clearAllData: 'Are you sure you want to clear all data? This action cannot be undone.',
        importData: 'Import will replace all current data. Continue?',
        restoreBackup: 'Are you sure you want to restore this backup? Current data will be replaced.',
        resetSettings: 'Are you sure you want to reset all settings?'
      },
      shortcuts: {
        newTask: 'New Task',
        search: 'Search Tasks',
        toggleComplete: 'Toggle Complete',
        deleteTask: 'Delete Task',
        undo: 'Undo',
        exportData: 'Export Data',
        openSettings: 'Open Settings',
        clearSelection: 'Clear Selection'
      },
      time: {
        today: 'Today',
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
        thisWeek: 'This Week',
        lastWeek: 'Last Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        custom: 'Custom',
        
        justNow: 'Just now',
        minutesAgo: ' minutes ago',
        hoursAgo: ' hours ago',
        daysAgo: ' days ago',
        weeksAgo: ' weeks ago',
        monthsAgo: ' months ago',
        yearsAgo: ' years ago'
      }
    };
  }
}

// 导出单例实例
export const i18nService = new I18nService();

// 导出类型和服务
export { I18nService };
export default i18nService;
