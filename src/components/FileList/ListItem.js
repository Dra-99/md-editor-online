import React, { useState, useRef, useEffect, useContext } from "react"
import PropTypes from "prop-types"
import { LayoutContext } from "../../layout/index"
import "./index.css"
import useContextMenu from "../../hooks/useContextMenu"
const { MenuItem, Menu } = window.require("@electron/remote")

const ListItem = ({ fileItem }) => {

    const [isEdit, setIsEdit] = useState(false)
    const [editValue, setEditValue] = useState(fileItem.title)
    const inpRef = useRef()
    const { handleFileSelect, deleteFile, editFileName, cancelCreate } = useContext(LayoutContext)

    const menuList = [
        new MenuItem({
            label: '打开',
            click:() => {
                console.log("open")
            }
        }),
        new MenuItem({
            label: '重命名',
            click:() => {
                console.log("rename")
            }
        }),
        new MenuItem({
            label: '删除',
            click:() => {
                console.log("shanchu")
            }
        })
    ]

    useContextMenu(menuList);

    // useEffect(() => {
    //     const menu = new Menu();
    //     let isOpen = false;
    //     if (isOpen) return;
    //     menu.append(new MenuItem({
    //         label: "哈哈"
    //     }))
    //     window.addEventListener("contextmenu", (e) => {
    //         console.log(e)
    //         if (e) {
    //             isOpen = true;
    //         }
    //         menu.popup()
    //     })
    // }, [])

    const handleEdit = () => {
        if (!isEdit) {
            setIsEdit(fileItem.title)
        }
        setIsEdit(!isEdit)
    }

    useEffect(() => {
        if (fileItem.isNew) {
            setIsEdit(true)
        }
    }, [fileItem.isNew])

    // 退出编辑
    const exitEdit = () => {
        setIsEdit(false)
        if (fileItem.isNew) {
            cancelCreate()
        }
    }

    const changeFileName = () => {
        if (!editValue.trim().length) return;
        editFileName(editValue, fileItem.id, () => {
            setIsEdit(false)
        })
    }

    useEffect(() => {
        if (isEdit) {
            inpRef.current.focus()
        }
    }, [isEdit])

    useEffect(() => {
        const handleFun = (e) => {
            if (e.key === "Enter" && isEdit && editValue) {
                changeFileName()
            }
            if (e.key === "Escape") {
                exitEdit()
            }
        }
        window.addEventListener("keydown", handleFun);
        return () => window.removeEventListener("keydown", handleFun)
    }, [editValue, isEdit])

    return <div className="row d-flex py-2 align-items-center" style={{ borderBottom: '1px solid rgb(221 221 221)' }}>
        <i className="iconfont icon-markdown col-2"  style={{ fontSize: '20px' }}></i>
        <div className="ml-1 col-7" style={{cursor: "pointer"}}>
          {(isEdit || fileItem.isNew) ? <input className="form-control" ref={inpRef} value={editValue} onChange={e => {
            setEditValue(e.target.value)
          }} type={"text"} /> : <div className="content-item" onClick={() => handleFileSelect(fileItem.id)}>{fileItem.title}</div>}
        </div>
        <div className="operation ml-auto col-3">
            {(isEdit || fileItem.isNew) ? <>
                <i className="iconfont icon-cuowu" onClick={exitEdit} style={{ fontSize: '20px', marginRight: 10, cursor: "pointer" }}></i>
                <i className="iconfont icon-duihao" onClick={changeFileName}  style={{ fontSize: '24px', cursor: "pointer" }}></i>
            </> : <>
                <i className="iconfont icon-bianjishuru" onClick={handleEdit} style={{ fontSize: '20px', marginRight: 10, cursor: "pointer" }}></i>
                <i className="iconfont icon-shanchu" onClick={() => deleteFile(fileItem.id)} style={{ fontSize: '20px', cursor: "pointer" }}></i>
            </>}
        </div>
    </div>
}

ListItem.propTypes = {
    fileItem: PropTypes.object,
}

export default ListItem