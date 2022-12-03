import React, { useState, useContext, createContext, useEffect, useCallback } from "react"
import LeftPane from "../pages/leftPane";
import RightPane from "../pages/rightPane";
import "./index.css"
import { v4 as uuidv4 } from "uuid"
import moment from "moment"
import { changeArrToFlatten, changeFlattenToArr } from "../utils/flattenChange";
import fsHelper from "../utils/fileHelper"
const path = window.require('path')
const app = window.require("@electron/remote").app;
const documentPath = app.getPath("documents");
const mdFilePath = path.resolve(documentPath, 'md')
const Store = window.require("electron-store")
export const store = new Store({name: 'md-list'})
export const LayoutContext = createContext()

const saveToStore = (file) => {
    const newData = file.reduce((prev, item) => {
        prev[item.id] = {
            id: item.id,
            path: item.path,
            createAt: item.createAt,
            title: item.title
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

    const handleFileSelect = (id) => {
        if (!openFileTab.find(item => item.id === id)) {
            setOpenFileTab([...openFileTab, fileList.find(item => item.id === id)])
        }
        setCurrentOpen(id)
    }

    const handleReadFile = (id) => {
        setOpenFileTab(openFileTab.map(item => {
            if (item.id === id) {
                item.isRead = true;
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
    }

    const deleteFile = (id) => {
        const currentFile = fileList.find(item => item.id === id);
        fsHelper.deleteFile(path.resolve(mdFilePath, `${currentFile.title}.md`)).then(() => {
            const newData = fileList.filter(item => item.id !== id)
            saveToStore(newData)
            setFileList(newData)
            if (openFileTab.find(item => item.id === id)) {
                setOpenFileTab(openFileTab.filter(item => item.id !== id))
            }
        })
    }

    const editFileName = async (newName, id, cb) => {
        // 判断是新建还是重命名
        const currentFile = fileList.find(item => item.id === id);
        const newPath = path.resolve(mdFilePath, `${newName}.md`);
        if (currentFile.isNew) {
            // 新建
            await fsHelper.writeFile(newPath, currentFile.body)
        } else {
            await fsHelper.renameFile(path.resolve(mdFilePath, `${currentFile.title}.md`), newPath);
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

    // 文件搜索
    const handleFileSearch = useCallback((searchValue) => {
        setSearchFiles(fileList.filter(item => item.title.includes(searchValue)));
    }, [fileList])
    
    useEffect(() => {
        setCurrentOpen(openFileTab.length > 0 ? openFileTab[openFileTab.length - 1].id : undefined)
    }, [openFileTab])

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
                    <LeftPane fileList={searchFiles.length ? searchFiles : fileList} createFile={createFile} />
                </div> 
                <div className="col-9 right_container">
                    {openFileTab.length ?
                        <RightPane 
                            fileList={openFileTab} 
                            handleFileChange={handleFileChange}
                            currentOpen={currentOpen} 
                            unsaveFiles={unsaveFiles} 
                            handleReadFile={handleReadFile}
                            setUnSaveFiles={setUnSaveFiles}
                        /> :
                        <div className="null_tip">请选择或新建md文件</div>
                    }
                </div>
            </LayoutContext.Provider>
        </div>
    </div>
}

export default Layout;