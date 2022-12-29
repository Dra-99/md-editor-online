const remote = window.require("@electron/remote");
const Store = window.require("electron-store")
const store = new Store({
    name: 'settings'
})

const $ = (classOrId) => {
    const result = document.querySelectorAll(classOrId);
    return result.length > 1 ? result : result[0]
}

document.addEventListener("DOMContentLoaded", () => {
    let savePath = store.get('path');
    if (savePath) {
        $('#savedFileLocation').value = savePath;
    }
    $('#select-new-location').addEventListener('click', () => {
        remote.dialog.showOpenDialog({
            title: '选择存储文件路径',
            properties: ['openDirectory']
        }).then(res => {
            savePath = res.filePaths[0];
            $('#savedFileLocation').value = savePath || '';
        })
    })
    $('.btn-primary').addEventListener('click', (e) => {
        e.preventDefault()
        store.set('path', savePath);
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