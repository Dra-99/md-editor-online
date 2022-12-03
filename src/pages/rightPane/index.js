import React, { useEffect, useState, useReducer, useRef } from "react"
import TabBar from "../../components/TabBar"
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import PropTypes from "prop-types"
import fsHelper from "../../utils/fileHelper";
import * as marked from 'marked'
// import { store } from "../../layout";

const initialState = { unsaveContent: [] }

const reducer = ({ unsaveContent }, { type, payload }) => {
    switch(type) {
        case 'initContent': 
            if (unsaveContent.find(item => item.id === payload.id)) {
                return { unsaveContent }
            } else {
                return {
                    unsaveContent: [...unsaveContent, payload]
                }
            }
        case 'changeContent': 
            return { 
                unsaveContent: unsaveContent.map(item => {
                    if (item.id === payload.id) {
                        item.content = payload.content
                    }
                    return item
                })
            }
        default: 
            return unsaveContent
    }
}

const RightPane = ({ fileList, currentOpen, unsaveFiles, handleFileChange, handleReadFile, setUnSaveFiles }) => {
    const currentFile = fileList.find(item => item.id === currentOpen)
    const [state, dispatch] = useReducer(reducer, initialState)
    const activeFile = state.unsaveContent.find(item => item.id === currentOpen)
    const content = activeFile ? activeFile.content : ''
    const editorRef = useRef(null)

    useEffect(() => {
        if (!currentFile.isRead) {
            fsHelper.readFile(currentFile.path).then(content => {
                handleReadFile(currentOpen)
                dispatch({
                    type: 'initContent',
                    payload: {
                        id: currentOpen,
                        content
                    }
                })
            })
        }
    }, [currentFile])


    useEffect(() => {
        document.addEventListener('keydown', function(e){
            console.log(e)
            if (e.key === 's' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
                // e.preventDefault();
                alert('saved');
                editorRef.current.focus()
             }
        });
    }, [])

    const handleSave = () => {
        const unsaveContent = state.unsaveContent.find(item => item.id === currentOpen);
        fsHelper.writeFile(currentFile.path, unsaveContent.content).then(res => {
            setUnSaveFiles(unsaveFiles.filter(id => id !== currentOpen))
        });
    }
    console.log(unsaveFiles)

    const handleContentChange = (val) => {
        handleFileChange(val, currentOpen);
        dispatch({
            type: 'changeContent',
            payload: {
                id: currentOpen,
                content: val
            }
        })
    }
    return <div>
        <TabBar tabBarList={fileList} currentOpen={currentOpen} unsaveFiles={unsaveFiles} />
        <SimpleMDE
            options={{
                minHeight: '550px',
                autofocus: true,
                previewRender:(plainText, preview) => { // Async method
                    setTimeout(() => {
                        preview.innerHTML = marked.parse(plainText);
                    }, 250);
                    return "Loading...";
                }}
            }
            ref={editorRef}
            onChange={val => handleContentChange(val)}
            value={content ? content : '请输入内容'}
        />
        <div onClick={handleSave} className="text-center d-block btn btn-primary">
            保存
        </div>
    </div>
}

RightPane.propTypes = {
    fileList: PropTypes.array,
    currentOpen: PropTypes.string,
    unsaveFiles: PropTypes.array,
    handleFileChange: PropTypes.func,
    handleReadFile: PropTypes.func
}

RightPane.defaultProps = {
    fileList: []
}

export default RightPane