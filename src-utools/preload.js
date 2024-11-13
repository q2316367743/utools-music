const {readFile, readdir, statSync, writeFile
    , existsSync, createWriteStream} = require('node:fs');
const {join, basename, extname} = require('node:path');
const {URL} = require("node:url");
const https = require("node:https");
const http = require("node:http");
const {atob} = require('node:buffer')
const {ipcRenderer} = require("electron");

/**
 * 获取一个文件
 * @param options {options: {
 *     title?: string,
 *     defaultPath?: string,
 *     buttonLabel?: string,
 *     filters?: { name: string, extensions: string[] }[],
 *     properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>,
 *     message?: string,
 *     securityScopedBookmarks?: boolean
 *   }} 参数
 * @return {Promise<File>} 返回blob对象
 */
function openFile(options) {
    return new Promise((resolve, reject) => {
        const paths = utools.showOpenDialog(options);
        const path = paths[0];
        if (path) {
            readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                const blob = new Blob([data], {type: 'application/octet-stream'});
                resolve(new File([blob], basename(path)));
            })
        }
    })
}

/**
 * 从url下载一个文件
 * @param url 文件地址
 * @param path 保存的地址
 * @return {Promise<void>}
 */
function downloadFileFromUrl(url, path) {
    const file = createWriteStream(path);
    const link = new URL(url);

    return new Promise((resolve, reject) => {
        file.on('finish', function () {
            file.close();
            resolve();
        }).on('error', e => {
            file.close();
            reject(e);
        });

        (link.protocol.startsWith("https") ? https : http).get(link, (response) => {
            response.pipe(file);
        }).on('error', (error) => {
            reject(error);
        }).end();
    })

}

/**
 * 下载一个文件
 * @param data {string | Blob | ArrayBuffer} 文件内容，可以使blob(file)或ArrayBuffer或者链接或者DATA URL
 * @param name {string} 文件名
 * @param [folder] {string} 所在目录
 * @return {Promise<string>};
 */
async function downloadFile(data, name, folder) {
    let target;
    if (!folder) {
        target = utools.showSaveDialog({
            title: '请选择文件保存位置',
            buttonLabel: '保存',
            defaultPath: join(utools.getPath('downloads'), name),
            properties: ['createDirectory']
        });
    } else {
        target = join(folder, name);
    }
    if (!target) {
        return Promise.reject(new Error("请选择文件保存位置"))
    }
    return new Promise(async (resolve, reject) => {
        if (data instanceof ArrayBuffer) {
            writeFile(target, new Uint8Array(data), e => {
                if (e) {
                    return reject(e)
                }
                resolve(target);
            });
        } else if (data instanceof Blob) {
            const ab = await data.arrayBuffer();
            writeFile(target, new Uint8Array(ab), e => {
                if (e) {
                    return reject(e)
                }
                resolve(target);
            });
        } else {
            // 如果是链接
            if (/^https?:\/\//.test(data)) {
                return downloadFileFromUrl(data, target)
                    .then(() => resolve(target))
                    .catch(reject);
            } else if (/^data:(.*?);base64,/.test(data)) {
                // 数据URL
                let byteCharacters = atob(
                    data.replace(/^data:(.*?);base64,/, "")
                );
                let byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                let byteArray = new Uint8Array(byteNumbers);
                writeFile(target, byteArray, e => {
                    if (e) {
                        return reject(e)
                    }
                    resolve(target);
                });
            } else {
                reject(new Error("文件内容未知"))
            }
        }
    })
}

/**
 * 发送歌词到歌词窗口
 * @param ids {Array<number>} 接受者ID
 * @param content {any} 内容
 */
function sendLyric(ids, content) {
    for (let id of ids) {
        ipcRenderer.sendTo(id, 'lyric', content);
    }
}


window.preload = {
    openFile, downloadFileFromUrl, downloadFile,
    fs: {
        existsSync,
        readdir,
        statSync,
        readFile
    },
    path: {
        join, basename, extname
    },
    ipcRenderer: {
        sendLyric
    },
}
