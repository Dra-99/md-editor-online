import React, { useEffect, useState } from "react"
import TabBar from "../../components/TabBar"
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import PropTypes from "prop-types"
import fsHelper from "../../utils/fileHelper";
// import { store } from "../../layout";

const RightPane = ({ fileList, currentOpen, unsaveFiles, handleFileChange, handleReadFile }) => {
    const currentFile = fileList.find(item => item.id === currentOpen)
    const [changeContent, setChangeContent] = useState([])

    useEffect(() => {
        if (!currentFile.isRead) {
            fsHelper.readFile(currentFile.path).then(content => {
                handleUnsaveContent(content)
                handleReadFile(currentOpen)
            })
        }
    }, [currentFile])

    // 保存为更改内容的临时空间
    const handleUnsaveContent = (content) => {
        if (changeContent.find(item => item.id === currentOpen)) {
            setChangeContent(changeContent.map(item => {
                if (item.id === currentOpen) {
                    item.content = content;
                }
                return item;
            }))
        } else {
            const newData = [...changeContent, {
                id: currentOpen,
                content
            }]
            console.log(newData)
            setChangeContent(newData)
        }
    }

    const activeFile = changeContent.find(item => item.id === currentOpen);
    const content = activeFile ? activeFile.content : ''

    const handleContentChange = (val) => {
        handleFileChange(val, currentOpen);
        handleUnsaveContent(val)
    }
    console.log(changeContent)
    return <div>
        <TabBar tabBarList={fileList} currentOpen={currentOpen} unsaveFiles={unsaveFiles} />
        <SimpleMDE
            options={{
                maxHeight: '600px',
                autofocus: true
            }}
            onChange={val => handleContentChange(val)}
            value={content ? content : '请输入内容'}
        />
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