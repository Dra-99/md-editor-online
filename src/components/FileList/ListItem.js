import React, { useState, useRef, useEffect, useCallback, useContext } from "react"
import PropTypes from "prop-types"
import { LayoutContext } from "../../layout/index"

const ListItem = ({ fileItem, onEdit }) => {

    const [isEdit, setIsEdit] = useState(false)
    const [editValue, setEditValue] = useState(fileItem.title)
    const inpRef = useRef()
    const { handleFileSelect } = useContext(LayoutContext)

    const handleEdit = () => {
        if (!isEdit) {
            setIsEdit(fileItem.title)
        }
        setIsEdit(!isEdit)
    }

    // 退出编辑
    const exitEdit = () => {
        setIsEdit(false)
    }

    useEffect(() => {
        if (isEdit) {
            inpRef.current.focus()
        }
    }, [isEdit])

    useEffect(() => {
        const handleFun = (e) => {
            if (e.key === "Enter" && isEdit && editValue) {
                onEdit(editValue)
            }
            if (e.key === "Escape") {
                if (isEdit) {
                    setIsEdit(false)
                }
            }
        }
        window.addEventListener("keydown", handleFun);
        return () => window.removeEventListener("keydown", handleFun)
    }, [editValue, isEdit])

    return <div className="row d-flex py-2 align-items-center" style={{ borderBottom: '1px solid rgb(221 221 221)' }}>
        <i className="iconfont icon-markdown col-2"  style={{ fontSize: '20px' }}></i>
        <div className="ml-1 col-7" style={{cursor: "pointer"}}>
          {isEdit ? <input className="form-control" ref={inpRef} value={editValue} onChange={e => {
            setEditValue(e.target.value)
          }} type={"text"} /> : <div onClick={() => handleFileSelect(fileItem.id)}>{fileItem.title}</div>}
        </div>
        <div className="operation ml-auto col-3">
            {isEdit ? <>
                <i className="iconfont icon-cuowu" onClick={exitEdit} style={{ fontSize: '20px', marginRight: 10, cursor: "pointer" }}></i>
                <i className="iconfont icon-duihao"  style={{ fontSize: '24px', cursor: "pointer" }}></i>
            </> : <>
                <i className="iconfont icon-bianjishuru" onClick={handleEdit} style={{ fontSize: '20px', marginRight: 10, cursor: "pointer" }}></i>
                <i className="iconfont icon-shanchu"  style={{ fontSize: '20px', cursor: "pointer" }}></i>
            </>}
        </div>
    </div>
}

ListItem.propTypes = {
    fileItem: PropTypes.object,
    onEdit: PropTypes.func
}

export default ListItem