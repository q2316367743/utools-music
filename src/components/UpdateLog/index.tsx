import {Constants} from "@/global/Constant";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {DialogPlugin, Link, Paragraph} from "tdesign-vue-next";
import {getUpdateLogs} from "@/global/UpdateLog";
import {isEmptyArray} from "@/utils/lang/FieldUtil";

function openUrl(url: string) {
  utools.shellOpenExternal(url);
}

function welcome() {
  return new Promise<void>(resolve => {
    const dialogInstance = DialogPlugin({
      header: '欢迎使用【音乐播放器】',
      default: () => <div>
        <Paragraph>uTools最好的音乐播放器，通过插件无限拓展</Paragraph>
        <Paragraph>本插件以本地音乐优先，也支持通过插件获取网络音乐进行试听</Paragraph>
        <Paragraph>
          <span>特别感谢</span>
          <Link theme="primary" onClick={() => openUrl('https://musicfree.catcat.work/')}>MusicFree</Link>
          <span>对本插件的启发，本插件的拓展设计基于此项目，与此项目通用</span>
        </Paragraph>
      </div>,
      footer: false,
      onClose() {
        resolve();
        dialogInstance.destroy();
      }
    });
  })
}

function showUpdateLog(newVersion: string, oldVersion: string) {
  return new Promise<void>(resolve => {
    const updateLogs = getUpdateLogs(newVersion, oldVersion);
    if (isEmptyArray(updateLogs)) {
      return;
    }
    const dialogInstance = DialogPlugin({
      header: `恭喜你更新到${newVersion}`,
      top: '8vh',
      default: () => <div style={{maxHeight: '45vh', overflowY: 'auto'}}>
        <Paragraph>本次更新了一下内容</Paragraph>
        {updateLogs.map(log => <div>
          <h3>{log.version}</h3>
          <ul>
            {log.logs.map(l => <li>{l}</li>)}
          </ul>
        </div>)}
      </div>,
      footer: false,
      onClose() {
        resolve();
        dialogInstance.destroy();
      }
    });
  })
}

export async function versionCheck() {
  const newVersion = Constants.version;
  let oldVersion = utools.dbStorage.getItem(LocalNameEnum.KEY_VERSION);
  if (!oldVersion) {
    oldVersion = '0.0.0'
    // 欢迎
    await welcome();
  }
  if (newVersion === oldVersion) {
    return;
  }
  utools.dbStorage.setItem(LocalNameEnum.KEY_VERSION, newVersion);
  await showUpdateLog(newVersion, oldVersion);
}