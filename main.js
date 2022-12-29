const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron')
const isDev = require("electron-is-dev")
const path = require("path")
const fs = require("fs")
const menuTemplate = require("./src/menuTemplate")
const AppWindow = require("./src/AppWindow")
require("@electron/remote/main").initialize()
const Store = require("electron-store")
Store.initRenderer();
let mainWindow, settingWindow;

const createWindow = () => {
  mainWindow = new AppWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, //可以使用node环境
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      enableRemoteModule: true //允许渲染进行使用远程模块
    }
  }, isDev ? 'http://localhost:3000' : 'mysiteurl');
  mainWindow.on("closed", () => {
    mainWindow = null;
  })
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  ipcMain.on("open-settings-window", () => {
    settingWindow =  new AppWindow({
      webPreferences: {
        nodeIntegration: true, //可以使用node环境
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: false,
        enableRemoteModule: true //允许渲染进行使用远程模块
      }
    }, path.resolve(__dirname, "settingPage/index.html"));
    settingWindow.removeMenu()
    settingWindow.on('closed', () => {
      settingWindow = null
    })
  })
}

app.whenReady().then(() => {
  createWindow()
})