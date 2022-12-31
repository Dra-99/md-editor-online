import React, { useEffect, useCallback, useMemo } from "react"
import TabBar from "../../components/TabBar"
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import PropTypes from "prop-types"
import fsHelper from "../../utils/fileHelper";
import * as marked from 'marked'
import message from "../../utils/message";
import { store } from "../../layout";
import useIpcRender from "../../hooks/useIpcRender";
import "./index.css"
const Store = window.require("electron-store");
const settingStore = new Store({ name: 'settings' })
const { ipcRenderer } = window.require("electron")


const RightPane = ({ fileList, currentOpen, unsaveFiles, handleFileChange, handleReadFile, setUnSaveFiles, openFileTab, handleUnsedFile }) => {
    const currentFile = fileList.find(item => item.id === currentOpen) ?? {}
    const content = currentFile.content;
    useEffect(() => {
        if (currentFile && !currentFile.isRead) {
            fsHelper.readFile(currentFile.path).then(content => {
                handleReadFile(currentOpen, content)
            }).catch(err => {
                if (err) {
                    message('文件不存在', 'error');
                    handleUnsedFile(currentFile.id)
                }
            })
        }
    }, [currentOpen])

    const handleSave = () => {
        if (unsaveFiles.includes(currentOpen)) {
            const { content, path, title } = currentFile;
            fsHelper.writeFile(path, content).then(res => {
                setUnSaveFiles(unsaveFiles.filter(id => id !== currentOpen))
            });
            if (settingStore.get("enableAutoSync")) {
                ipcRenderer.send("upload-file-sync", { 
                    key: `${title}.md`,
                    path
                })
            }
        }
    }
    
    const handleContentChange = useCallback((val) => {
        if (val !== content) {
            handleFileChange(val, currentOpen);
        }
    }, [currentOpen])
    
    useIpcRender({
        'save-edit-file': handleSave
    })

    const autofocusNoSpellcheckerOptions = useMemo(() => {
        return {
          autofocus: true,
          spellChecker: false,
          minHeight: '550px',
          maxHeight: '580px',
          previewRender:(plainText, preview) => { // Async method
                return preview.innerHTML = marked.parse(plainText) ? marked.parse(plainText) : 'loading...';
            }
        }
      }, []);

    return <div className="md-area">
        <TabBar tabBarList={openFileTab} currentOpen={currentOpen} unsaveFiles={unsaveFiles} />
        <SimpleMDE
            options={autofocusNoSpellcheckerOptions}
            onChange={val => handleContentChange(val)}
            value={content ? content : '请输入内容'}
        />
        <div className="sync-tip">{currentFile.isSynced && `已同步，同步时间：${currentFile.updateAt}`}</div>
    </div>
}

RightPane.propTypes = {
    fileList: PropTypes.array,
    currentOpen: PropTypes.string,
    unsaveFiles: PropTypes.array,
    handleFileChange: PropTypes.func,
    handleReadFile: PropTypes.func,
    openFileTab: PropTypes.array,
    handleUnsedFile: PropTypes.func
}

RightPane.defaultProps = {
    fileList: [],
    openFileTab: []
}

export default RightPane