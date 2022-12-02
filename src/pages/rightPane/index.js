import React, { useEffect } from "react"
import TabBar from "../../components/TabBar"
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import PropTypes from "prop-types"

const rightPane = ({ fileList, currentOpen, unsaveFiles, handleFileChange }) => {

    const currentFile = fileList.find(item => item.id === currentOpen)

    return <div>
        <TabBar tabBarList={fileList} currentOpen={currentOpen} unsaveFiles={unsaveFiles} />
        <SimpleMDE
            options={{
                maxHeight: '600px',
                autofocus: true
            }}
            onChange={val => handleFileChange(val, currentOpen)}
            value={currentFile ? currentFile.body : '请输入内容'}
        />
    </div>
}

rightPane.propTypes = {
    fileList: PropTypes.array,
    currentOpen: PropTypes.number,
    unsaveFiles: PropTypes.array,
    handleFileChange: PropTypes.func
}

rightPane.defaultProps = {
    fileList: []
}

export default rightPane