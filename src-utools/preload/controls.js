const { ipcRenderer } = require('electron')
// 插件的窗口ID
let parentId = null;
// 管道名称，可以自定义，只需要和发送时的管道名称一致即可
const channel =  'controls'

window.preload = {
    /***  接收主窗口发送过来的消息  ***/
    receiveMsg: (callback) => {
        ipcRenderer.on(channel, (event, res) => {
            // 保存插件的窗口ID
            parentId = event.senderId;
            if (res) {
                callback(res);
            }
        })
    },
    /***  向插件主窗口发送消息  ***/
    sendMsg: (msg) => {
        if (parentId) {
            ipcRenderer.sendTo(parentId, channel, msg);
        }
    }
}
