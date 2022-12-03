const fs = window.require("fs")
// const path = require("path")

const fsHelper = {
    readFile: (filePath) => {
        return fs.promises.readFile(filePath, { encoding: 'utf-8' })
    },
    writeFile: (filePath, content) => {
        return fs.promises.writeFile(filePath, content, { encoding: 'utf-8' })
    },
    deleteFile: (filePath) => {
        return fs.promises.unlink(filePath)
    },
    renameFile: (oldPath, newPath) => {
        return fs.promises.rename(oldPath, newPath)
    },
    createDir: (path) => {
        return fs.mkdir(path)
    }
}

export default fsHelper

// fsHelper.readFile(path.resolve(__dirname, 'debounceValue.js')).then(res => {
//     console.log(res)
// })

// fsHelper.writeFile(path.resolve(__dirname, 'bb.md'), '## 你好').then(() => {
//     console.log("写入成功")
// })

// fsHelper.renameFile(path.resolve(__dirname, 'bb.md'), path.resolve(__dirname, 'niha.md')).then(res => {
//     console.log("重命名成功")
// })

// fsHelper.deleteFile(path.resolve(__dirname, 'niha.md')).then(res => {
//     console.log("删除成功")
// })