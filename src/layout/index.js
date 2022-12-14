import React, { useState, createContext, useEffect, useCallback } from "react"
import LeftPane from "../pages/leftPane";
import RightPane from "../pages/rightPane";
import "./index.css"
import { v4 as uuidv4 } from "uuid"
import moment from "moment"
import { changeArrToFlatten, changeFlattenToArr } from "../utils/flattenChange";
import fsHelper from "../utils/fileHelper"
import message from "../utils/message";
import useIpcRender from "../hooks/useIpcRender";
const path = window.require('path')
const remote = window.require("@electron/remote");
const app = remote.app;
const Store = window.require("electron-store")
export const store = new Store({name: 'md-list'})
const settingStore = new Store({ name: "settings" })
let mdFilePath = settingStore.get('savedFileLocation') || app.getPath("documents");
// const mdFilePath = path.resolve(documentPath, 'md')
export const LayoutContext = createContext()
const { ipcRenderer } = window.require("electron")

//   // fs.mkdir(app.getPath("documents"));
//   let filePath = path.join(app.getPath("documents"), 'md')
//   // 判断文件是否存在
//   fs.access(filePath, fs.constants.F_OK, function (err) {
//     if (err) {
//       fs.mkdir(filePath, function (err) {
//         if (err) {
//           console.log(err)
//         }
//       })
//     }
//   });

const saveToStore = (file) => {
    const newData = file.reduce((prev, item) => {
        prev[item.id] = {
            id: item.id,
            path: item.path,
            createAt: item.createAt,
            title: item.title,
            isSynced: !!item.isSynced,
            updateAt: item.updateAt
        }
        return prev;
    }, {})
    store.set('files', newData)
}

const Layout = () => {

    const [fileList, setFileList] = useState(changeFlattenToArr(store.get('files')))
    const [openFileTab, setOpenFileTab] = useState([])
    const [currentOpen, setCurrentOpen] = useState() //当前正在打开的tab
    const [unsaveFiles, setUnSaveFiles] = useState([])
    const [searchFiles, setSearchFiles] = useState([])
    // const [changeTabContent, setChangeTabContent] = useState(store.get("unsaveContent"))

    settingStore.onDidAnyChange(() => {
        console.log('changed')
        mdFilePath = settingStore.get('savedFileLocation') || app.getPath("documents");
    })

    const handleFileSelect = (id) => {
        const currentFile = fileList.find(item => item.id === id);
        const { path, title, id: fid } = currentFile;
        if (!openFileTab.find(item => item.id === id)) {
            setOpenFileTab([...openFileTab, fileList.find(item => item.id === id)])
        }
        setCurrentOpen(id)
        if (settingStore.get('enableAutoSync')) {
            ipcRenderer.send('download-file-sync', { key: `${title}.md`, path, id: fid })
        }
    }

    const handleReadFile = (id, content) => {
        // setOpenFileTab(openFileTab.map(item => {
        //     if (item.id === id) {
        //         item.isRead = true;
        //         item.content = content;
        //     }
        //     return item;
        // }))
        setFileList(fileList.map(item => {
            if (item.id === id) {
                item.isRead = true;
                item.content = content;
            }
            return item;
        }))
    }

    const closeTab = (id) => {
        setOpenFileTab(openFileTab.filter(item => item.id !== id));
    }

    const switchSelect = (id) => {
        setCurrentOpen(id)
    }

    const handleFileChange = (newContent, id) => {
        if (!unsaveFiles.includes(id)) {
            setUnSaveFiles([...unsaveFiles, id])
        }
        setFileList(fileList.map(item => {
            if (item.id === id) {
                item.isRead = true;
                item.content = newContent;
            }
            return item;
        }))
    }


    const deleteFile = (id) => {
        const currentFile = fileList.find(item => item.id === id);
        fsHelper.deleteFile(currentFile.path).then(() => {
            const newData = fileList.filter(item => item.id !== id)
            saveToStore(newData)
            setFileList(newData)
            if (openFileTab.find(item => item.id === id)) {
                setOpenFileTab(openFileTab.filter(item => item.id !== id))
            }
        })
    }

    const handleUnsedFile = (id) => {
        const newFileList = fileList.filter(item => item.id !== id);
        setFileList(newFileList);
        saveToStore(newFileList)
        setCurrentOpen(fileList.length ? fileList[0].id : undefined)
        setOpenFileTab(openFileTab.filter(item => item.id !== id))
        setSearchFiles([])
    }

    const editFileName = async (newName, id, cb) => {
        if (fileList.find(item => item.title === newName)) {
            message('文件名已存在', 'info')
            return
        }
        // 判断是新建还是重命名
        const currentFile = fileList.find(item => item.id === id);
        // 新建时的默认路径，取的是electron指定的目录
        const newPath = path.resolve(mdFilePath, `${newName}.md`);
        if (currentFile.isNew) {
            // 新建
            await fsHelper.writeFile(newPath, currentFile.body)
        } else {
            // 因为可能文件由外部导入，这里新路径情况是不确定的
            const newPath = path.join(path.dirname(currentFile.path), `${newName}.md`)
            await fsHelper.renameFile(currentFile.path, newPath);
        }
        const newData = fileList.map(item => {
            if (item.id === id) {
                item.title = newName;
                item.isNew = false;
                item.path = newPath;
            }
            return item
        })
        saveToStore(newData);
        setFileList(newData)
        cb && cb()
    }

    const createFile = () => {
        if (fileList.find(item => item.isNew)) {
            message('完成当前新建文件', 'info')
            return;
        }
        const newFileList = [
            ...fileList,
            {
                id: uuidv4(),
                title: '',
                body: '## 请输入内容',
                createAt: moment().format('YYYY-MM-DD hh:mm:ss'),
                isNew: true
            }
        ]
        setFileList(newFileList)
        setSearchFiles([])
    }

    const cancelCreate = () => {
        setFileList(fileList.filter(item => !item.isNew))
    }

    // 导入文件
    const exportFile = () => {
        remote.dialog.showOpenDialog({
            title: '选择 md 文件',
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Markdown files', extensions: ['md'] }
            ]
        }).then(result => {
            const filePaths = Array.from(result.filePaths);
            // 过滤出未导入的路径
            const fileteredPaths = filePaths.filter(path => fileList.find(item => item.path !== path));
            const addFiles = fileteredPaths.map(p => ({
                title: path.parse(p).name,
                path: p,
                id: uuidv4(),
                createAt: moment().format('YYYY-MM-DD hh:mm:ss')
            }))
            const allFiles = fileList.concat(addFiles)
            setFileList(allFiles);
            saveToStore(allFiles);
            setSearchFiles([])
        })
    }

    // 文件搜索
    const handleFileSearch = useCallback((searchValue) => {
        setSearchFiles(fileList.filter(item => item.title.includes(searchValue)));
    }, [fileList])
    
    useEffect(() => {
        setCurrentOpen(openFileTab.length > 0 ? openFileTab[openFileTab.length - 1].id : undefined)
    }, [openFileTab])

    const handleFileSyncUpdated = () => {
        const newFileList = fileList.map(item => {
            if (item.id === currentOpen) {
                item = {
                    ...item,
                    isSynced: true,
                    updateAt: moment().format('YYYY-MM-DD hh:mm:ss')
                }
            }
            return item;
        })
        setFileList(newFileList);
        saveToStore(newFileList)
    }

    const activeFileDownloaded = (event, message) => {
        const currentFile = fileList.find(item => item.id === message.id);
        const { id, path } = currentFile
        fsHelper.readFile(path).then(value => {
          let newFile
          if (message.status === 'download-success') {
            newFile = fileList.map(item => {
                if (item.id === id) {
                    item = {
                        ...item,
                        content: value,
                        isLoad: true,
                        isSynced: true,
                        updateAt: moment().format('YYYY-MM-DD hh:mm:ss')
                    }
                }
                return item
            })
          } else {
            newFile = fileList.map(item => {
                if (item.id === id) {
                    item = {
                        ...item,
                        content: value,
                        isLoad: true
                    }
                }
                return item;
            })
          }
          setFileList(newFile)
          saveToStore(newFile)
        })
    }

    useIpcRender({
        'create-new-file': createFile,
        'import-file': exportFile,
        'file-sync-updated': handleFileSyncUpdated,
        'file-downloaded': activeFileDownloaded,
    })

    return <div className="content">
        <div className="row">
            <LayoutContext.Provider value={{
                handleFileSelect,
                closeTab,
                switchSelect,
                deleteFile,
                editFileName,
                handleFileSearch,
                cancelCreate
            }}>
                <div className="col-3 px-0 overflow-hidden">
                    <LeftPane fileList={searchFiles.length ? searchFiles : fileList} createFile={createFile} exportFile={exportFile} />
                </div> 
                <div className="col-9 right_container">
                    {openFileTab.length ?
                        <RightPane 
                            fileList={fileList} 
                            openFileTab={openFileTab}
                            handleFileChange={handleFileChange}
                            currentOpen={currentOpen} 
                            unsaveFiles={unsaveFiles} 
                            handleReadFile={handleReadFile}
                            setUnSaveFiles={setUnSaveFiles}
                            handleUnsedFile={handleUnsedFile}
                        /> :
                        <div className="null_tip">请选择或新建md文件</div>
                    }
                </div>
            </LayoutContext.Provider>
        </div>
    </div>
}

export default Layout;