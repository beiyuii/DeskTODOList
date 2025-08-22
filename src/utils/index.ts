/**
 * 通用工具函数库
 * 
 * @author 桌面TODO团队
 */

import { v4 as uuidv4 } from 'uuid';
import { Priority } from '../types';

/**
 * 生成UUID v4格式的唯一标识符
 * 
 * @returns {string} UUID字符串
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * 获取当前时间的ISO8601格式字符串
 * 
 * @returns {string} ISO8601格式的时间字符串
 */
export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

/**
 * 格式化日期为本地化字符串
 * 
 * @param {string} isoString - ISO8601格式的时间字符串
 * @param {string} locale - 本地化语言代码，默认为'zh-CN'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (isoString: string, locale: string = 'zh-CN'): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * 格式化日期时间为本地化字符串
 * 
 * @param {string} isoString - ISO8601格式的时间字符串
 * @param {string} locale - 本地化语言代码，默认为'zh-CN'
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (isoString: string, locale: string = 'zh-CN'): string => {
  const date = new Date(isoString);
  return date.toLocaleString(locale);
};

/**
 * 检查任务是否已过期
 * 
 * @param {string | undefined} dueDate - 截止日期
 * @returns {boolean} 是否过期
 */
export const isTaskOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

/**
 * 获取优先级的颜色配置
 * 
 * @param {Priority} priority - 优先级
 * @returns {object} 包含颜色类名的对象
 */
export const getPriorityColor = (priority: Priority) => {
  const colors = {
    low: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      dot: 'bg-green-500'
    },
    medium: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500'
    },
    high: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800',
      dot: 'bg-red-500'
    }
  };
  return colors[priority];
};

/**
 * 防抖函数
 * 
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * 节流函数
 * 
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 深拷贝对象
 * 
 * @param {T} obj - 要拷贝的对象
 * @returns {T} 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 截断文本并添加省略号
 * 
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * 验证邮箱格式
 * 
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 生成随机颜色（十六进制）
 * 
 * @returns {string} 十六进制颜色值
 */
export const generateRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * 计算两个日期之间的天数差
 * 
 * @param {string} date1 - 第一个日期（ISO格式）
 * @param {string} date2 - 第二个日期（ISO格式）
 * @returns {number} 天数差
 */
export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
