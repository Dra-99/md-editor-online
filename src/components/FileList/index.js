import React from "react"
import PropTypes from "prop-types"
import ListItem from "./ListItem"
import "./index.css"

const FileList = ({ fileList }) => {
    return <div className="file_list_container px-4">
        {fileList.map(item => <ListItem fileItem={item} key={item.id} />)}
    </div>
}

FileList.propTypes = {
    fileList: PropTypes.array
}

export default FileList