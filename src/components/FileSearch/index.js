import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types";

const SearchFile = ({ title = "我的云文件", callBack }) => {

    const [isShowSearch, setIsShowSearch] = useState(false);
    const [searchValue, setSearchValue] = useState("")
    const inpRef = useRef();

    const handleSearch = () => {
        if (isShowSearch) {
            setSearchValue('')
        }
        setIsShowSearch(!isShowSearch)
    }

    useEffect(() => {
        if (isShowSearch) {
            inpRef.current.focus()
        }
    }, [isShowSearch])

    useEffect(() => {
        const handleFun = (e) => {
            if (e.key === "Enter" && isShowSearch && searchValue) {
                callBack(searchValue)
            }
            if (e.key === "Escape") {
                setSearchValue("");
                if (isShowSearch) {
                    setIsShowSearch(false)
                }
            }
        }
        window.addEventListener("keydown", handleFun);
        return () => window.removeEventListener("keydown", handleFun)
    }, [searchValue, isShowSearch])

    return <div className="row d-flex align-items-center justify-content-between py-2 alert alert-primary mb-0">
        <div className="col-8">
            { isShowSearch ? <input type={'text'} ref={inpRef} value={searchValue} onChange={e => {
                setSearchValue(e.target.value)
            }} className="form-control" placeholder="searchValue"/> : title }
        </div>
        <div className="col-4 ml-2" onClick={handleSearch}>
            <i type="button" className={`btn btn-primary iconfont ${!isShowSearch ? 'icon-sousuoxiao' : 'icon-cuowu'}`}></i>
        </div>
    </div>
}

SearchFile.propTypes = {
    title: PropTypes.string,
    callBack: PropTypes.func
}

export default SearchFile;