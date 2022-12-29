import { useEffect } from "react";
const remote = window.require("@electron/remote")
const { Menu, MenuItem } = remote;


const useContextMenu = (menuList = []) => {
    useEffect(() => {
        const menu = new Menu();
        menuList.forEach(item => {
            menu.append(new MenuItem(item));
        })
        const showMenu = (e) => {
            // console.log(e)
            menu.popup({
                window: remote.getCurrentWindow()
            });
        }

        window.addEventListener("contextmenu", showMenu)
        return () => {
            window.removeEventListener("contextmenu", showMenu)
        };
    }, [])
}

export default useContextMenu;