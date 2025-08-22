import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {BrowserWindow|null} */
let mainWindow = null
/** @type {Tray|null} */
let tray = null
let alwaysOnTop = false

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        transparent: false,
        backgroundColor: '#ffffff',
        hasShadow: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true
        }
    })

    mainWindow.setAlwaysOnTop(alwaysOnTop)

    const devServer = process.env.VITE_DEV_SERVER_URL
    if (devServer) {
        mainWindow.loadURL(devServer)
        mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
        mainWindow.loadFile(path.join(process.cwd(), 'dist', 'index.html'))
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    // 阻止窗口意外关闭
    mainWindow.on('close', (event) => {
        if (process.platform === 'darwin') {
            event.preventDefault()
            mainWindow?.hide()
        }
    })
}

// 构建托盘菜单
const getMenu = () => Menu.buildFromTemplate([
    {
        label: alwaysOnTop ? '取消置顶' : '置顶悬浮',
        type: 'normal',
        click: () => {
            alwaysOnTop = !alwaysOnTop;
            mainWindow?.setAlwaysOnTop(alwaysOnTop);
            tray?.setContextMenu(getMenu());
        }
    },
    { type: 'separator' },
    {
        label: '显示/隐藏',
        type: 'normal',
        click: () => {
            if (mainWindow?.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow?.show();
            }
        }
    },
    { type: 'separator' },
    { label: '退出', role: 'quit' }
]);

function buildTray() {
    // 创建一个简单的图标（如果没有图标文件）
    const iconPath = path.join(process.cwd(), 'public', process.platform === 'win32' ? 'icon.ico' : 'icon.png');

    let image;
    try {
        image = nativeImage.createFromPath(iconPath);
        if (image.isEmpty()) {
            // 如果图标为空，创建一个简单的图标
            image = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVDiNpZM9SwNBEIafgxBsLERsrQQrwcJCG1sLwUKwsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQ');
        }
    } catch (error) {
        // 创建一个16x16的简单图标
        image = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVDiNpZM9SwNBEIafgxBsLERsrQQrwcJCG1sLwUKwsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQsLBQ');
    }

    tray = new Tray(image);
    tray.setToolTip('DeskTodoList - 桌面待办事项');
    tray.setContextMenu(getMenu());

    // 双击托盘图标显示/隐藏窗口
    tray.on('double-click', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow?.show();
        }
    });
}

// IPC处理程序
ipcMain.handle('get-always-on-top', () => alwaysOnTop);

ipcMain.handle('toggle-always-on-top', () => {
    alwaysOnTop = !alwaysOnTop;
    mainWindow?.setAlwaysOnTop(alwaysOnTop);
    // 更新托盘菜单
    if (tray) {
        tray.setContextMenu(getMenu());
    }
    return alwaysOnTop;
});

ipcMain.handle('set-always-on-top', (_, value) => {
    alwaysOnTop = Boolean(value);
    mainWindow?.setAlwaysOnTop(alwaysOnTop);
    // 更新托盘菜单
    if (tray) {
        tray.setContextMenu(getMenu());
    }
    return alwaysOnTop;
});

ipcMain.handle('set-theme', (_, theme) => {
    // 主题设置（这里可以进一步处理系统主题）
    console.log('设置主题:', theme);
});

ipcMain.handle('minimize-window', () => {
    mainWindow?.minimize();
});

ipcMain.handle('maximize-window', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.handle('close-window', () => {
    if (process.platform === 'darwin') {
        mainWindow?.hide();
    } else {
        app.quit();
    }
});

ipcMain.handle('toggle-window', () => {
    if (mainWindow?.isVisible()) {
        mainWindow.hide();
    } else {
        mainWindow?.show();
    }
});

ipcMain.handle('quit-app', () => {
    app.quit();
});

app.whenReady().then(() => {
    createWindow()
    buildTray()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
