const {
  app,
  dialog,
  Menu,
  ipcMain
} = require('electron')
const isDev = require("electron-is-dev")
const path = require("path")
const fs = require("fs")
const menuTemplate = require("./src/menuTemplate")
const AppWindow = require("./src/AppWindow")
const createQiniuManage = require("./src/QiniuyunManage")
const remote = require("@electron/remote/main")
remote.initialize()
const Store = require("electron-store")
Store.initRenderer();
const fileStore = new Store({ name: 'md-list' })
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
    settingWindow = new AppWindow({
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

  ipcMain.on("update-all-menu", () => {
    delete require.cache[require.resolve('./src/menuTemplate')]
    const menuTemplate = require('./src/menuTemplate')
    const menu = Menu.buildFromTemplate(menuTemplate)
    mainWindow.setMenu(menu)
  })

  ipcMain.on('upload-file-sync', (e, data) => {
    const qiniuyunManage = createQiniuManage()
    qiniuyunManage.uploadFile(data.path, data.key).then(res => {
      mainWindow.webContents.send('file-sync-updated')
    }).catch(err => {
      dialog.showErrorBox('同步失败', '请检查七牛云平台参数配置是否正确')
    })
  })

  ipcMain.on('download-file-sync', (e, data) => {
    const manager = createQiniuManage()
    const filesObj = fileStore.get('files')
    const { key, path, id } = data
    manager.getStat(key).then((resp) => {
      const serverUpdatedTime = Math.round(resp.putTime / 10000)
      let localUpdatedTime = filesObj[id].updateAt;
      // 将日期转为时间戳
      localUpdatedTime = new Date(localUpdatedTime).getTime();
      console.log(serverUpdatedTime, localUpdatedTime)
      if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
        manager.downloadFile(key, path).then(() => {
          mainWindow.webContents.send('file-downloaded', {status: 'download-success', id})
        })
      } else {
        mainWindow.webContents.send('file-downloaded', {status: 'no-new-file', id})
      }
    }, (error) => {  
      console.log(error)
      if (error.statusCode === 612) {
        mainWindow.webContents.send('file-downloaded', {status: 'no-file', id})
      }
    })
  })   
}

app.whenReady().then(() => {
  createWindow()
})