import style from "./message.module.css"

const message = (msg, type, duration = 20000) => {
    const div = document.createElement('div');
    div.className = `${style['div-container']} ${style[type]}`
    div.innerText = msg
    document.body.appendChild(div);
    const res = div.clientHeight;
    div.style.opacity = 1;
    div.style.transform = `translate(-50%, -50%)`;
    setTimeout(() => {
        div.style.opacity = 0;
        div.style.transform = `translate(-50%, -50%) translateY(-25px)`;
        div.addEventListener(
            "transitionend",
            function () {
                div.remove();
                // 运行回调函数
            }, {
                once: true
            }
        );
    }, duration)
}

export default message