import React from "react"
import SearchFile from "../../components/FileSearch"
import FileList from "../../components/FileList"
import PropTypes from "prop-types"
import "./index.css"

const leftPane = ({ fileList }) => {

    const handleSearch = (searchValue) => {
        console.log(searchValue)
    }

    return <div className="left_pane_container bg-light">
        <SearchFile callBack={handleSearch}/>
        <FileList fileList={fileList} />
        <div className="row footer_btn">
            <button type="button" className="col-6 text-dark  btn btn-primary">
                <i className="iconfont icon-xinjian"></i>
                新建
            </button>
            <button type="button" className="col-6 text-dark btn btn-info">
                <i className="iconfont icon-daoru"></i>
                导入
            </button>
        </div>
    </div>
}

leftPane.propTypes = {
    fileList: PropTypes.array
}

leftPane.defaultProps = {
    fileList: []
}

export default leftPane