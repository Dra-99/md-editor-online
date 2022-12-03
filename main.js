const {
  app,
  BrowserWindow
} = require('electron')
const isDev = require("electron-is-dev")
const path = require("path")
const fs = require("fs")
require("@electron/remote/main").initialize()
const Store = require("electron-store")
Store.initRenderer()

const createWindow = () => {
  // fs.mkdir(app.getPath("documents"));
  let filePath = path.join(app.getPath("documents"), 'md')
  // 判断文件是否存在
  fs.access(filePath, fs.constants.F_OK, function (err) {
    if (err) {
      fs.mkdir(filePath, function (err) {
        if (err) {
          console.log(err)
        }
      })
    }
  });
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, //可以使用node环境
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      enableRemoteModule: true //允许渲染进行使用远程模块
    }
  })
  require("@electron/remote/main").enable(win.webContents)
  win.loadURL(isDev ? 'http://localhost:3000' : 'mysiteurl')
}

app.whenReady().then(() => {
  createWindow()
})