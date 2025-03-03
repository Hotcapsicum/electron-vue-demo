'use strict'

import { app, protocol, BrowserWindow, Menu, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])
// 隐藏应用程序顶部的菜单栏，mac和windows操作方式不同
function createMenu() {
    // darwin表示macOS，针对macOS的设置
    if (process.platform === 'darwin') {
        const template = [
        {
          label: 'App Demo',
            submenu: [
                {
                    role: 'about'
                },
                {
                    role: 'quit'
                }]
        }]
        let menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    } else {
      // windows及linux系统
        Menu.setApplicationMenu(null)
    }
}
async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            webSecurity: false,
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
        }
    })
    createMenu()
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
    // 调出控制台
    // windows： Ctrl+Shift+i； macOS：Commond+Shift+i
    globalShortcut.register('CommandOrControl+Shift+i', function () {
        win.webContents.openDevTools()
    })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment) {
      // Install Vue Devtools
      try {
          await installExtension(VUEJS_DEVTOOLS)
      } catch (e) {
          console.error('Vue Devtools failed to install:', e.toString())
      }

      // globalShortcut.register('CommandOrControl+Shift+i', function () {
      //     win.webContents.openDevTools()
      // })
    }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
              app.quit()
          }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
