/**
 * 国际化Hook
 * 提供多语言翻译功能的React Hook
 * 
 * @author 桌面TODO团队
 */

import { useCallback, useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { i18nService, SupportedLanguage } from '../services/i18n';

/**
 * 国际化Hook接口
 */
export interface UseI18nReturn {
  /** 翻译函数 */
  t: (key: string) => string;
  /** 当前语言 */
  currentLanguage: SupportedLanguage;
  /** 支持的语言列表 */
  supportedLanguages: { code: SupportedLanguage; name: string; nativeName: string }[];
  /** 设置语言 */
  setLanguage: (language: SupportedLanguage) => void;
}

/**
 * 国际化Hook
 */
export const useI18n = (): UseI18nReturn => {
  const { settings, setLanguage: updateSettings } = useSettingsStore();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(settings.language as SupportedLanguage);

  /**
   * 翻译函数
   */
  const t = useCallback((key: string): string => {
    return i18nService.t(key);
  }, []);

  /**
   * 设置语言
   */
  const setLanguage = useCallback((language: SupportedLanguage) => {
    i18nService.setLanguage(language);
    updateSettings(language);
    setCurrentLanguage(language);
  }, [updateSettings]);

  /**
   * 监听设置变化
   */
  useEffect(() => {
    const newLanguage = settings.language as SupportedLanguage;
    if (newLanguage !== currentLanguage) {
      i18nService.setLanguage(newLanguage);
      setCurrentLanguage(newLanguage);
    }
  }, [settings.language, currentLanguage]);

  /**
   * 初始化语言设置
   */
  useEffect(() => {
    i18nService.updateLanguage();
  }, []);

  return {
    t,
    currentLanguage,
    supportedLanguages: i18nService.getSupportedLanguages(),
    setLanguage
  };
};

export default useI18n;
