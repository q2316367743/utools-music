const http = require('node:http');
const https = require('node:https');
const fs = require('fs');
const {URL} = require('node:url');

/**
 * 下载文件
 * @param config {DownloadFileConfig} 下载配置
 * @return {DownloadFileResult}
 */
function downloadOneFile(config) {
    const {
        url, path,
        onProgress, onSuccess, onError
    } = config;
    const file = fs.createWriteStream(path);
    const link = new URL(url);
    let totalSize = 0;
    let downloadedSize = 0;

    file.on('finish', function () {
        file.close();
        onSuccess();
    }).on('error', e => {
        file.close();
        onError(e);
    });

    const request = (link.protocol.startsWith("https") ? https : http).get(link, (response) => {
        totalSize = parseInt(response.headers['content-length'], 10);

        response.on('data', function (chunk) {
            downloadedSize += chunk.length;
            onProgress(downloadedSize, totalSize);
        });

        response.on('end', function () {
            onProgress(totalSize, totalSize);
        });

        response.pipe(file);
    }).on('error', (error) => {
        onError(error);
    }).end();

    return {
        cancel: (remove = true) => {
            request.destroy();
            file.destroy()
            if (remove) {
                fs.unlinkSync(path);
            }
        }
    }
}

module.exports = {
    downloadOneFile
}