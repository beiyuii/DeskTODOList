/**
 * 任务详情编辑组件
 * 提供完整的任务编辑界面，包括标题、描述、优先级、截止日期等
 * 
 * @author 桌面TODO团队
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, Tag, FileText, AlertCircle, Plus, Trash2, Edit3 } from 'lucide-react';
import { Task, Priority } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { getPriorityColor, formatDate } from '../utils';
import clsx from 'clsx';

/**
 * 任务详情组件Props
 */
interface TaskDetailProps {
  /** 任务ID */
  taskId: string | null;
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 样式类名 */
  className?: string;
}

/**
 * 任务详情编辑组件
 */
export const TaskDetail: React.FC<TaskDetailProps> = ({
  taskId,
  isOpen,
  onClose,
  className
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; content: string; created_at: string }>>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { tasks, updateTask } = useTaskStore();

  // 获取当前任务
  const currentTask = taskId ? tasks.find(task => task.id === taskId) : null;

  /**
   * 重置表单状态
   */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags([]);
    setNewTag('');
    setNotes([]);
    setNewNote('');
    setEditingNoteId(null);
    setEditingNoteContent('');
    setIsSaving(false);
  };

  /**
   * 加载任务数据到表单
   */
  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title);
      setDescription(currentTask.description || '');
      setPriority(currentTask.priority);
      setDueDate(currentTask.due_date ? currentTask.due_date.split('T')[0] : '');
      setTags([...currentTask.tags]);
      setNotes([...currentTask.notes]);
    } else {
      resetForm();
    }
  }, [currentTask]);

  /**
   * 自动聚焦标题输入框
   */
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * 处理保存
   */
  const handleSave = async () => {
    if (!currentTask || !title.trim()) return;

    setIsSaving(true);
    try {
      await updateTask(currentTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        tags: tags.filter(tag => tag.trim()),
        notes: notes
      });
      onClose();
    } catch (error) {
      console.error('保存任务失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('有未保存的更改，确定要关闭吗？')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  /**
   * 检查是否有更改
   */
  const hasChanges = (): boolean => {
    if (!currentTask) return false;
    
    return (
      title !== currentTask.title ||
      description !== (currentTask.description || '') ||
      priority !== currentTask.priority ||
      dueDate !== (currentTask.due_date ? currentTask.due_date.split('T')[0] : '') ||
      JSON.stringify(tags) !== JSON.stringify(currentTask.tags) ||
      JSON.stringify(notes) !== JSON.stringify(currentTask.notes)
    );
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  /**
   * 添加标签
   */
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  /**
   * 删除标签
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  /**
   * 处理标签输入键盘事件
   */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  /**
   * 添加新备注
   */
  const handleAddNote = () => {
    const trimmedNote = newNote.trim();
    if (!trimmedNote) return;

    const newNoteObj = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: trimmedNote,
      created_at: new Date().toISOString()
    };

    setNotes([...notes, newNoteObj]);
    setNewNote('');
  };

  /**
   * 删除备注
   */
  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  /**
   * 开始编辑备注
   */
  const handleStartEditNote = (note: { id: string; content: string; created_at: string }) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  /**
   * 保存备注编辑
   */
  const handleSaveNoteEdit = () => {
    if (!editingNoteId || !editingNoteContent.trim()) return;

    setNotes(notes.map(note => 
      note.id === editingNoteId 
        ? { ...note, content: editingNoteContent.trim() }
        : note
    ));
    
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  /**
   * 取消备注编辑
   */
  const handleCancelNoteEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  /**
   * 处理备注输入键盘事件
   */
  const handleNoteKeyDown = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (action === 'add') {
        handleAddNote();
      } else {
        handleSaveNoteEdit();
      }
    } else if (e.key === 'Escape' && action === 'edit') {
      handleCancelNoteEdit();
    }
  };

  const priorityOptions: { value: Priority; label: string }[] = [
    { value: 'low', label: '低优先级' },
    { value: 'medium', label: '中优先级' },
    { value: 'high', label: '高优先级' }
  ];

  if (!isOpen || !currentTask) {
    return null;
  }

  return (
    <div className={clsx(
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
      className
    )}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            编辑任务
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              className={clsx(
                'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                title.trim() && !isSaving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? '保存中...' : '保存'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              任务标题 *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题..."
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-1 flex justify-between">
              <span className="text-xs text-gray-500">
                {title.length > 180 && `${title.length}/200 字符`}
              </span>
              {!title.trim() && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  标题不能为空
                </span>
              )}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              任务描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加详细描述..."
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {description.length > 900 && (
              <p className="mt-1 text-xs text-gray-500">
                {description.length}/1000 字符
              </p>
            )}
          </div>

          {/* 优先级和截止日期 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                优先级
              </label>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={priority === option.value}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="sr-only"
                    />
                    <div className={clsx(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      priority === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}>
                      {priority === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={clsx(
                          'w-3 h-3 rounded-full',
                          getPriorityColor(option.value).dot
                        )} 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 截止日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                截止日期
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  清除日期
                </button>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              标签
            </label>
            
            {/* 现有标签 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 添加新标签 */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="添加标签..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          {/* 备注管理 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              备注
            </label>
            
            {/* 现有备注列表 */}
            {notes.length > 0 && (
              <div className="space-y-3 mb-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-gray-50/70 dark:bg-gray-700/70 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                  >
                    {editingNoteId === note.id ? (
                      // 编辑模式
                      <div className="space-y-2">
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          onKeyDown={(e) => handleNoteKeyDown(e, 'edit')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          placeholder="编辑备注内容..."
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={handleCancelNoteEdit}
                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveNoteEdit}
                            disabled={!editingNoteContent.trim()}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 显示模式
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(note.created_at)}
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-3">
                          <button
                            type="button"
                            onClick={() => handleStartEditNote(note)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
                            title="编辑备注"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                            title="删除备注"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 添加新备注 */}
            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => handleNoteKeyDown(e, 'add')}
                placeholder="添加新备注... (Enter发送，Shift+Enter换行)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Enter 发送，Shift+Enter 换行
                </span>
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加备注</span>
                </button>
              </div>
            </div>
          </div>

          {/* 任务信息 */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">创建时间：</span>
                <span>{formatDate(currentTask.created_at)}</span>
              </div>
              <div>
                <span className="font-medium">最后更新：</span>
                <span>{formatDate(currentTask.updated_at)}</span>
              </div>
              {currentTask.completed_at && (
                <div className="col-span-2">
                  <span className="font-medium">完成时间：</span>
                  <span>{formatDate(currentTask.completed_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            快捷键：Ctrl+Enter 保存，Esc 关闭
          </p>
        </div>
      </div>
    </div>
  );
};
