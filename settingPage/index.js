const remote = window.require("@electron/remote");
const Store = window.require("electron-store")
const { ipcRenderer } = window.require("electron")
const store = new Store({
    name: 'settings'
})

const saveDataDOM = ['#savedFileLocation', '#accessKey', '#secretKey', '#bucketName']

const $ = (classOrId) => {
    const result = document.querySelectorAll(classOrId);
    return result.length > 1 ? result : result[0]
}

document.addEventListener("DOMContentLoaded", () => {
    saveDataDOM.forEach(item => {
        const value = store.get(item.substring(1));
        if (value) {
            $(item).value = value;
        }
    })
    $('#select-new-location').addEventListener('click', () => {
        remote.dialog.showOpenDialog({
            title: '选择存储文件路径',
            properties: ['openDirectory']
        }).then(res => {
            const savePath = res.filePaths[0];
            $('#savedFileLocation').value = savePath || '';
        })
    })
    $('.btn-primary').addEventListener('click', (e) => {
        e.preventDefault()
        saveDataDOM.forEach(item => {
            const currentEle = $(item);
            if (currentEle) {
                const { id, value } = currentEle;
                store.set(id, value ? value : '');
            }
        })
        ipcRenderer.send('update-all-menu')
        remote.getCurrentWindow().close()
    })
    $('.nav-tabs').addEventListener('click', (e) => {
        e.preventDefault()
        $('.nav-link').forEach(item => item.classList.remove('active'));
        e.target.classList.add('active')
        $('.config-area').forEach(element => {
            element.style.display = 'none'
        })
        $(e.target.dataset.tab).style.display = 'block'
    })
})