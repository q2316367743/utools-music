import {defineStore} from "pinia";
import {MusicItem} from "@/entity/MusicItem";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import NotificationUtil from "@/utils/modal/NotificationUtil";
import {DownloadIngItem, DownloadItem} from "@/entity/DownloadItem";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {downloadFolder} from "@/store";

// 首先添加一个处理文件名的辅助函数
function sanitizeFileName(fileName: string): string {
  // 移除或替换不安全的文件名字符
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // 替换 Windows 不允许的字符
    .trim();
}

export const useDownloadStore = defineStore('download', () => {
  const ings = ref(new Array<DownloadIngItem>());
  const dones = ref(new Array<DownloadItem>());
  let rev: string | undefined = undefined;

  // 存储下载任务的中止控制器
  const abortControllers = new Map<number, DownloadFileResult>();

  async function init() {
    const res = await listByAsync<DownloadItem>(LocalNameEnum.LIST_DOWNLOAD);
    // 刚创建，如果下载中，则变成失败
    dones.value = res.list.map(e => ({
      ...e,
      status: e.status === 1 ? 3 : e.status,
      msg: e.status === 1 ? '下载中断' : ''
    }));
    rev = res.rev
  }

  init()
    .then(() => console.log("下载列表初始化成功"))
    .catch(err => NotificationUtil.error('下载列表初始化失败', "下载管理器", err));

  async function updateList() {
    rev = await saveListByAsync(LocalNameEnum.LIST_DOWNLOAD, dones.value, rev);
  }

  async function emitWrap(item: MusicItem) {
    const {url, cover, lyric, name, artist} = item;
    const downloadItem: DownloadIngItem = {
      id: Date.now(),
      name,
      artist,
      music: '',
      msg: '',
      url,
      cover,
      lyric,
      progress: 0,
      total: 0,
    }
    ings.value.push(downloadItem);
    // 执行下载
    await download(downloadItem);

  }

  async function download(item: DownloadIngItem) {
    NotificationUtil.success("开始下载", '下载管理器');


    const {name, artist, url} = item;
    const u = new URL(url);
    const extname = u.pathname.match(/\.[a-zA-Z]*$/);
    const basename = `${artist} - ${name}`;

    try {
      const fileName = `${basename}${extname ? extname[0] : '.mp3'}`;
      const mainPath = window.preload.path.join(downloadFolder.value, sanitizeFileName(fileName));
      item.music = mainPath;
      abortControllers.set(item.id, window.preload.customer.downloadOneFile({
        url,
        path: mainPath,
        onProgress: (p, t) => {
          let find = ings.value.find(e => e.id === item.id);
          if (find) {
            find.progress = p;
            find.total = t;
          }
        },
        onSuccess: () => {
          let index = ings.value.findIndex(e => e.id === item.id);
          if (index > -1) {
            let target = ings.value.splice(index, 1);
            if (target[0]) {
              dones.value.push({
                ...target[0],
                status: 2
              });
              updateList();
            }
          }
          abortControllers.delete(item.id);
        },
        onError: (e) => {
          let index = ings.value.findIndex(e => e.id === item.id);
          if (index > -1) {
            let target = ings.value.splice(index, 1);
            if (target[0]) {
              dones.value.push({
                ...target[0],
                status: 3,
                msg: `${(e as any).message || e}`
              });
              updateList();
            }
          }
          abortControllers.delete(item.id);
        }
      }));


      // 下载附件...
    } catch (e) {
      abortControllers.delete(item.id);
      throw e;
    }
  }

  function emit(item: MusicItem) {
    emitWrap(item)
      .then(() => NotificationUtil.success("下载成功", '下载管理器'))
      .catch(e => NotificationUtil.error("下载失败", '下载管理器', e));
  }

  async function remove(id: number) {
    const index = dones.value.findIndex(e => e.id === id);
    if (index > -1) {
      dones.value.splice(index, 1);
      await updateList();
    }
  }

  async function cacheAttachment(music: MusicItem, basename: string) {
    const {cover, lyric} = music;
    try {
      if (isNotEmptyString(cover) && cover) {
        const c = new URL(cover);
        const coverExtname = c.pathname.match(/\.[a-zA-Z]*$/);
        const coverFileName = `${basename}${coverExtname ? coverExtname[0] : '.png'}`;
        const coverPath = window.preload.path.join(
          downloadFolder.value,
          coverFileName,
        );
        if (!window.preload.fs.existsSync(coverPath)) {
          // 不存在，则下载
          await window.preload.customer.downloadFile(cover, coverFileName, downloadFolder.value)
        }
      }
    } catch (e) {
      console.error(`音乐【${music.name} - ${music.artist}】封面下载失败`);
    }
    try {
      if (isNotEmptyString(lyric) && lyric) {
        const l = new URL(lyric);
        const lyricExtname = l.pathname.match(/\.[a-zA-Z]*$/);
        const lyricFilename = `${basename}${lyricExtname ? lyricExtname[0] : '.lrc'}`;
        const lyricPath = window.preload.path.join(
          downloadFolder.value,
          lyricFilename
        );
        if (!window.preload.fs.existsSync(lyricPath)) {
          await window.preload.customer.downloadFile(lyric, lyricFilename, downloadFolder.value)
        }
      }
    } catch (e) {
      console.error(`音乐【${music.name} - ${music.artist}】歌词下载失败`);
    }
  }

  async function cacheWrap(music: MusicItem): Promise<boolean> {
    const {name, artist, url, cover, lyric} = music;
    const u = new URL(url);
    const extname = u.pathname.match(/\.[a-zA-Z]*$/);
    const basename = `${artist} - ${name}`;
    const fileName = `${basename}${extname ? extname[0] : '.mp3'}`;
    // 音乐路径
    const musicPath = window.preload.path.join(
      downloadFolder.value,
      fileName,
    );
    const exist = window.preload.fs.existsSync(musicPath);

    // 异步缓存附件
    cacheAttachment(music, basename)
      .then(() => console.log(`音乐【${basename}】附件缓存完成`))
      .catch(e => console.error(`音乐【${basename}】附件缓存失败`, e))

    if (!exist) {
      const downloadItem: DownloadItem = {
        id: Date.now(),
        name,
        artist,
        music: '',
        status: 1,
        msg: '',
        url,
        cover,
        lyric,
        progress: 0,
        total: 0
      }
      dones.value.push(downloadItem);
      await updateList();
      try {
        // 开始下载
        await window.preload.customer.downloadFile(url, fileName, downloadFolder.value);
        for (let i = 0; i < dones.value.length; i++) {
          const r = dones.value[i];
          if (r.id === downloadItem.id) {
            dones.value[i] = {
              ...dones.value[i],
              status: 2,
              music: musicPath
            }
            break;
          }
        }
        await updateList();
      } catch (e) {
        for (let i = 0; i < dones.value.length; i++) {
          const r = dones.value[i];
          if (r.id === downloadItem.id) {
            dones.value[i] = {
              ...dones.value[i],
              status: 3,
              msg: `${(e as any).message || e}`
            }
            break;
          }
        }
        await updateList();
        return Promise.reject(e);
      }
      return true;
    } else {
      return false;
    }


  }

  /**
   * 边听边存
   * @param music 当前播放的音乐
   */
  function cache(music: MusicItem) {
    cacheWrap(music)
      .then(res => res ?
        console.log(`音乐【${music.name} - ${music.artist}】缓存成功`) :
        console.log(`音乐【${music.name} - ${music.artist}】已存在，无需缓存`))
      .catch(e => NotificationUtil.error(`音乐【${music.name} - ${music.artist}】缓存失败`, '下载管理器', e));
  }

  // 添加取消下载方法
  async function cancel(id: number) {
    const controller = abortControllers.get(id);
    if (controller) {
      controller.cancel();
      abortControllers.delete(id);

      const index = ings.value.findIndex(e => e.id === id);
      if (index > -1) {
        ings.value.splice(index, 1);
      }
    }
  }

  return {
    ings, dones,
    emit, remove, download, cache, cancel
  }
})
