import MessageUtil from "@/utils/modal/MessageUtil";
import {globalSetting, pluginFontFamily} from "@/store";

export class MusicLyric {

  private readonly entityMap = new Map<number, BrowserWindow.WindowInstance>();

  private createWindow(callback: () => void) {
    const ubWindow = utools.createBrowserWindow('lyric/index.html', {
      // @ts-ignore
      useContentSize: true,
      skipTaskbar: true,
      width: 500,
      height: 100,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      hasShadow: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: 'lyric/preload.js',
        zoomFactor: 0,
        devTools: utools.isDev()
      }
    }, () => {
      try {
        ubWindow.show();
        this.entityMap.set(ubWindow.webContents.id, ubWindow);
        const {lyricBorderColor, lyricColor, lyricFontSize} = toRaw(globalSetting.value);
        window.preload.ipcRenderer.sendLyric([ubWindow.webContents.id], {
          type: 'config',
          value: {
            fontSize: lyricFontSize,
            color: lyricColor,
            borderColor: lyricBorderColor,
            fontFamily: pluginFontFamily.value
          }
        })
        callback()
      } catch (e) {
        MessageUtil.error("打开小窗失败", e);
      }
    });
  }

  switchWindow(callback: () => void) {
    if (this.entityMap.size === 0) {
      // 打开一个
      this.createWindow(callback);
    } else {
      try {
        this.entityMap.forEach(v => {
          v.close();
        });
        this.entityMap.clear();
      } catch (e) {
        this.entityMap.clear();
        // 报错了，创建
        this.createWindow(callback);
      }
    }
  }

  sendLyric(lyric: string) {
    if (this.entityMap.size === 0) {
      return;
    }
    window.preload.ipcRenderer.sendLyric(Array.from(this.entityMap.keys()), {
      type: 'lyric',
      value: lyric
    });
  }

}
