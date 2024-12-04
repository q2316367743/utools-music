import MessageUtil from "@/utils/modal/MessageUtil";
import {audio, music, pre, next, played} from "@/components/MusicPlayer/MusicPlayer";

type MusicControl = 'play' | 'pause';

export class MusicControls {

  private ubWindow: BrowserWindow.WindowInstance | null = null;

  constructor() {
    this.enableInterval();
    this.enableControls();
  }

  private enableInterval() {
    setInterval(() => {
      if (!this.ubWindow) {
        return;
      }
      if (!music.value) {
        return;
      }
      // 发送状态
      window.preload.ipcRenderer.sendControls(this.ubWindow.webContents.id, {
        type: 'info',
        value: {
          cover: music.value.cover,
          name: music.value.name,
          artist: music.value.artist,
          album: music.value.album,
        }
      });
      window.preload.ipcRenderer.sendControls(this.ubWindow.webContents.id, {
        type: 'control',
        value: played.value ? 'play' : 'pause'
      });
    }, 100);
  }

  private enableControls() {
    window.preload.ipcRenderer.receiveControls(msg => {
      if (msg === 'play') {
        audio.play();
      } else if (msg === 'pause') {
        audio.pause();
      } else if (msg === 'pre') {
        pre()
      } else if (msg === 'next') {
        next()
      }
    })
  }

  private createWindow(callback?: () => void) {
    let ubWindow = utools.createBrowserWindow(
      utools.isDev() ? 'lyric/index.html' : 'dist/controls.html',
      {
        // @ts-ignore
        useContentSize: false,
        resizable: false,
        skipTaskbar: true,
        width: 335,
        height: 110,
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        webPreferences: {
          preload: 'preload/controls.js',
          zoomFactor: 0,
          devTools: utools.isDev(),
          webSecurity: false
        }
      }, () => {
        try {
          ubWindow.show();
          if (utools.isDev()) {
            ubWindow.webContents.executeJavaScript(`location.href = 'http://localhost:5173/controls.html'`)
              .then(() => console.log("代码执行成功"))
              .catch(e => console.error("代码执行失败", e));
            ubWindow.webContents.openDevTools();
          }
          callback && callback()

          window.preload.ipcRenderer.sendControls(ubWindow.webContents.id, {
            type: 'control',
            value: played.value ? 'play' : 'pause'
          });
        } catch (e) {
          MessageUtil.error("打开控制器失败", e);
        }
      });
    this.ubWindow = ubWindow;
  }

  switchWindow(callback?: () => void) {
    if (!this.ubWindow) {
      // 打开一个
      this.createWindow(callback);
    } else {
      try {
        this.ubWindow.close();
      } catch (e) {
        // 报错了，创建
        this.createWindow(callback);
      }
    }
  }


  sendProgress(progress: number, total: number): void {
    if (!this.ubWindow) {
      return;
    }
    window.preload.ipcRenderer.sendControls(this.ubWindow.webContents.id, {
      type: 'progress',
      value: {
        progress, total
      }
    });
  }

  sendControl(value: MusicControl): void {
    if (!this.ubWindow) {
      return;
    }
    window.preload.ipcRenderer.sendControls(this.ubWindow.webContents.id, {
      type: 'control',
      value
    });
  }

}
