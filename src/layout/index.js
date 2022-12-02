import React, { useState, useContext, createContext, useEffect, useCallback } from "react"
import LeftPane from "../pages/leftPane";
import RightPane from "../pages/rightPane";
import "./index.css"

export const LayoutContext = createContext()

const Layout = () => {

    const defaultList = [
        {
            id: 1,
            title: "哈哈哈",
            body: "## 这是标题",
            createAt: '222'
        },
        {
            id:2,
            title: "真不错1111111111",
            body: "## 这是标题",
            createAt: '222'
        },
        {
            id: 3,
            title: "还可以吧",
            body: "## 这是标题",
            createAt: '222'
        },
        {
            id: 4,
            title: "哈哈哈",
            body: "## 这是标题",
            createAt: '222'
        },
        {
            id: 5,
            title: "真不错1111111111",
            body: "## 这是真的不错的啦·1",
            createAt: '222'
        },
        {
            id: 6,
            title: "还可以吧",
            body: "## 这是还可以吧",
            createAt: '222'
        }
    ]
    const [fileList, setFileList] = useState(defaultList)
    const [openFileTab, setOpenFileTab] = useState([])
    const [currentOpen, setCurrentOpen] = useState() //当前正在打开的tab
    const [unsaveFiles, setUnSaveFiles] = useState([])

    const handleFileSelect = (id) => {
        if (!openFileTab.find(item => item.id === id)) {
            setOpenFileTab([...openFileTab, fileList.find(item => item.id === id)])
        }
        setCurrentOpen(id)
    }

    const closeTab = (id) => {
        setOpenFileTab(openFileTab.filter(item => item.id !== id));
    }

    const switchSelect = (id) => {
        setCurrentOpen(id)
    }

    const handleFileChange = useCallback((newContent, id) => {
        if (!unsaveFiles.includes(id)) {
            setUnSaveFiles([...unsaveFiles, id])
        }
        setFileList(fileList.map(item => {
            if (item.id === id) {
                item.body = newContent
            }
            return item
        }))
    }, [unsaveFiles, fileList])

    useEffect(() => {
        setCurrentOpen(openFileTab.length > 0 ? openFileTab[openFileTab.length - 1].id : undefined)
    }, [openFileTab])

    return <div className="content">
        <div className="row">
            <LayoutContext.Provider value={{
                handleFileSelect,
                closeTab,
                switchSelect
            }}>
                <div className="col-3 px-0 overflow-hidden">
                    <LeftPane fileList={fileList} />
                </div> 
                <div className="col-9 right_container">
                    {openFileTab.length ?
                        <RightPane fileList={openFileTab} handleFileChange={handleFileChange} currentOpen={currentOpen} unsaveFiles={unsaveFiles} /> :
                        <div className="null_tip">请选择或新建md文件</div>
                    }
                </div>
            </LayoutContext.Provider>
        </div>
    </div>
}

export default Layout;