import React from "react"
import PropTypes from "prop-types"
import TabItem from "./TabItem"

const TabBar = ({ tabBarList, currentOpen, unsaveFiles }) => {
    return <div className="d-flex tabbar_container">
        { tabBarList.map(item => <TabItem tabItem={item} key={item.id} active={item.id === currentOpen} unsave={unsaveFiles.includes(item.id)} />) }
    </div>
}

TabBar.propTypes = {
    tabBarList: PropTypes.array,            
    currentOpen: PropTypes.number,
    unsaveFiles: PropTypes.array
}

TabBar.defaultProps = {
    tabBarList: []
}

export default TabBar