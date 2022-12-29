const { BrowserWindow } = require("electron")

class AppWindow extends BrowserWindow {
    constructor(windowConfig, loadUrl) {
        const baseConfig = {
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            },
            show: false,
            backgroundColor: "#efefef"
        }
        const config = { ...baseConfig, ...windowConfig };
        super(config);
        this.loadURL(loadUrl);
        require("@electron/remote/main").enable(this.webContents)
        this.once("ready-to-show", () => {
            this.show()
        })
    }
}

module.exports = AppWindow