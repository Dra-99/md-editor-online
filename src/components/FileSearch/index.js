import React, { useEffect, useRef, useState, useContext } from "react"
import PropTypes from "prop-types";
import { useDebounceValue } from "../../utils/debounceValue";
import { LayoutContext } from "../../layout";

const SearchFile = ({ title = "我的云文件" }) => {
    const { handleFileSearch } = useContext(LayoutContext)
    const [isShowSearch, setIsShowSearch] = useState(false);
    const [searchValue, setSearchValue] = useState("")
    const inpRef = useRef();
    const debounceValue = useDebounceValue(searchValue, 500)
    
    useEffect(() => {
        if (isShowSearch) {
            inpRef.current.focus()
        }
        handleFileSearch(debounceValue)
    }, [debounceValue])

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
            // if (e.key === "Enter" && isShowSearch && searchValue) {
            //     searchFiles(debounceValue)
            // }
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
        <div className="col-10">
            { isShowSearch ? <input type={'text'} ref={inpRef} value={searchValue} onChange={e => {
                setSearchValue(e.target.value)
            }} className="form-control" placeholder="searchValue"/> : title }
        </div>
        <i onClick={handleSearch} style={{cursor: "pointer"}} className={`iconfont col-2 ${!isShowSearch ? 'icon-sousuoxiao' : 'icon-cuowu'}`}></i>
    </div>
}

SearchFile.propTypes = {
    title: PropTypes.string,
}

export default SearchFile;