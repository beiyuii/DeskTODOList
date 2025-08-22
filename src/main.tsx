import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

/**
 * 应用程序入口文件，负责渲染根组件。
 * 
 * @author
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);

