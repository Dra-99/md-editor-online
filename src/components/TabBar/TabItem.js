import React, { useContext } from "react"
import PropTypes from "prop-types"
import "./index.css"
import { LayoutContext } from "../../layout"

const TabItem = ({ tabItem, active, unsave }) => {

    const { closeTab, switchSelect } = useContext(LayoutContext)

    return <div className={`tab_item ${active ? "bg-primary" : 'bg-secondary'} py-2 d-flex align-items-center justify-content-between px-3 text-white`}>
        <div onClick={() => switchSelect(tabItem.id)} className="title">{tabItem.title}</div>
        <i onClick={() => closeTab(tabItem.id)} className="iconfont icon-cuowu"></i>
        {unsave && <i className="iconfont icon-yuandianzhong"></i>}
    </div>
}

TabItem.propTypes = {
    tabItem: PropTypes.object,
    active: PropTypes.bool,
    unsave: PropTypes.bool
}

TabItem.defaultProps = {
    tabItem: {}
}

export default TabItem;