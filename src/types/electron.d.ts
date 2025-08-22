/**
 * Electron API类型声明
 * 
 * @author 桌面TODO团队
 */

export interface ElectronAPI {
  /** 获取当前置顶状态 */
  getAlwaysOnTop(): Promise<boolean>;
  
  /** 切换置顶状态 */
  toggleAlwaysOnTop(): Promise<void>;
  
  /** 设置置顶状态 */
  setAlwaysOnTop(alwaysOnTop: boolean): Promise<void>;
  
  /** 设置主题 */
  setTheme(theme: 'light' | 'dark' | 'system'): void;
  
  /** 最小化窗口 */
  minimizeWindow(): void;
  
  /** 最大化窗口 */
  maximizeWindow(): void;
  
  /** 关闭窗口 */
  closeWindow(): void;
  
  /** 显示/隐藏窗口 */
  toggleWindow(): void;
  
  /** 退出应用 */
  quitApp(): void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
