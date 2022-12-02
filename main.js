const { app, BrowserWindow } = require('electron')
const isDev = require("electron-is-dev")

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
        nodeIntegration: true //可以使用node环境
    }
  })

  win.loadURL(isDev ? 'http://localhost:3000' : 'mysiteurl')
}

app.whenReady().then(() => {
  createWindow()
})